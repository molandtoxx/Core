<?php
/**
 * Copyright © MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Alexey Portnov, 7 2020
 */

namespace MikoPBX\Core\Workers;
require_once 'Globals.php';

use MikoPBX\Common\Models\{AsteriskManagerUsers,
    CallQueueMembers,
    CallQueues,
    Codecs,
    ConferenceRooms,
    CustomFiles,
    DialplanApplications,
    ExtensionForwardingRights,
    Extensions,
    ExternalPhones,
    Fail2BanRules,
    FirewallRules,
    Iax,
    IncomingRoutingTable,
    IvrMenu,
    IvrMenuActions,
    LanInterfaces,
    NetworkFilters,
    OutgoingRoutingTable,
    OutWorkTimes,
    PbxExtensionModules,
    PbxSettings,
    Sip,
    SoundFiles};
use MikoPBX\Core\Asterisk\Configs\QueueConf;
use MikoPBX\Core\System\{BeanstalkClient,
    Configs\CronConf,
    Configs\IptablesConf,
    Configs\NatsConf,
    Configs\NginxConf,
    Configs\SSHConf,
    PBX,
    System};

ini_set('error_reporting', E_ALL);
ini_set('display_startup_errors', 1);

class WorkerModelsEvents extends WorkerBase
{
    private const R_MANAGERS = 'reloadManager';

    private const R_QUEUES = 'reloadQueues';

    private const R_DIALPLAN = 'reloadDialplan';

    private const R_PBX_SETTINGS = 'clearCachePbxSettings';

    private const R_CUSTOM_F = 'updateCustomFiles';

    private const R_FIREWALL = 'reloadFirewall';

    private const R_NETWORK = 'networkReload';

    private const R_IAX = 'reloadIax';

    private const R_SIP = 'reloadSip';

    private const R_FEATURES = 'reloadFeatures';

    private const R_CRON = 'reloadCron';

    private const R_NGINX = 'reloadNginx';

    private const R_SSH = 'reloadSSH';

    private const R_LICENSE = 'reloadLicense';

    private const R_NATS = 'reloadNats';

    private const R_VOICEMAIL = 'reloadVoicemail';

    private $last_change;
    private $modified_tables;

    /**
     * @var PbxSettings
     */
    private $pbxSettings;
    private $timeout = 3;
    private $arrObject;
    private $PRIORITY_R;
    protected int $maxProc=1;


    /**
     * Entry point
     *
     * @param $argv
     */
    public function start($argv): void
    {

        $this->arrObject = $this->di->getShared('pbxConfModules');

        $this->PRIORITY_R = [
            self::R_PBX_SETTINGS,
            self::R_NETWORK,
            self::R_FIREWALL,
            self::R_SSH,
            self::R_LICENSE,
            self::R_NATS,
            self::R_NGINX,
            self::R_CRON,
            self::R_FEATURES,
            self::R_SIP,
            self::R_IAX,
            self::R_DIALPLAN,
            self::R_QUEUES,
            self::R_MANAGERS,
            self::R_CUSTOM_F,
            self::R_VOICEMAIL,
        ];

        $this->modified_tables = [];
        $this->pbxSettings     = new PbxSettings();

        $client = new BeanstalkClient();
        $client->subscribe(self::class, [$this, 'processModelChanges']);
        $client->subscribe($this->makePingTubeName(self::class), [$this, 'pingCallBack']);
        $client->setTimeoutHandler([$this, 'timeoutHandler']);


        while (true) {
            $client->wait();
        }
    }

    /**
     * Parser for received Beanstalk message
     *
     * @param BeanstalkClient $message
     */
    public function processModelChanges($message): void
    {
        $receivedMessage = json_decode($message->getBody(), true);
        $this->fillModifiedTables($receivedMessage);
        $this->startReload();

        // Send information about models changes to additional modules
        foreach ($this->arrObject as $appClass) {
            $appClass->modelsEventChangeData($receivedMessage);
        }
    }

    /**
     * Collect changes to determine which modules must be reloaded or reconfigured
     *
     * @param $data
     */
    private function fillModifiedTables($data): void
    {
        $count_changes = count($this->modified_tables);

        $called_class = $data['model'] ?? '';
        switch ($called_class) {
            case AsteriskManagerUsers::class:
                $this->modified_tables[self::R_MANAGERS] = true;
                break;
            case CallQueueMembers::class:
                $this->modified_tables[self::R_QUEUES] = true;
                break;
            case CallQueues::class:
                $this->modified_tables[self::R_QUEUES]   = true;
                $this->modified_tables[self::R_DIALPLAN] = true;
                break;
            case ConferenceRooms::class:
                $this->modified_tables[self::R_DIALPLAN] = true;
                break;
            case CustomFiles::class:
                $this->modified_tables[self::R_CUSTOM_F] = true;
                break;
            case DialplanApplications::class:
                $this->modified_tables[self::R_DIALPLAN] = true;
                break;
            case ExtensionForwardingRights::class:
                $this->modified_tables[self::R_SIP]      = true;
                $this->modified_tables[self::R_DIALPLAN] = true;
                break;
            case Extensions::class:
                $this->modified_tables[self::R_DIALPLAN] = true;
                break;
            case ExternalPhones::class:
                $this->modified_tables[self::R_DIALPLAN] = true;
                break;
            case Fail2BanRules::class:
                $this->modified_tables[self::R_FIREWALL] = true;
                break;
            case FirewallRules::class:
                $this->modified_tables[self::R_FIREWALL] = true;
                break;
            case Iax::class:
                $this->modified_tables[self::R_IAX]      = true;
                $this->modified_tables[self::R_DIALPLAN] = true;
                break;
            case Codecs::class:
                $this->modified_tables[self::R_IAX] = true;
                $this->modified_tables[self::R_SIP]     = true;
                break;
            case IncomingRoutingTable::class:
                $this->modified_tables[self::R_DIALPLAN] = true;
                break;
            case IvrMenu::class:
                $this->modified_tables[self::R_DIALPLAN] = true;
                break;
            case IvrMenuActions::class:
                $this->modified_tables[self::R_DIALPLAN] = true;
                break;
            case LanInterfaces::class:
                $this->modified_tables[self::R_NETWORK] = true;
                $this->modified_tables[self::R_IAX]     = true;
                $this->modified_tables[self::R_SIP]     = true;
                break;
            case NetworkFilters::class:
                $this->modified_tables[self::R_FIREWALL] = true;
                $this->modified_tables[self::R_SIP]      = true;
                $this->modified_tables[self::R_MANAGERS] = true;
                break;
            case OutgoingRoutingTable::class:
                $this->modified_tables[self::R_DIALPLAN] = true;
                break;
            case OutWorkTimes::class:
                $this->modified_tables[self::R_DIALPLAN] = true;
                break;
            case PbxSettings::class:
                $this->modified_tables[self::R_PBX_SETTINGS] = true;
                $this->pbxSettings->key = $data['recordId'] ?? '';
                if ($this->pbxSettings->itHasFeaturesSettingsChanges()) {
                    $this->modified_tables[self::R_FEATURES] = true;
                }
                if ($this->pbxSettings->itHasAMIParametersChanges()) {
                    $this->modified_tables[self::R_MANAGERS] = true;
                }
                if ($this->pbxSettings->itHasIaxParametersChanges()) {
                    $this->modified_tables[self::R_IAX] = true;
                }
                if ($this->pbxSettings->itHasSipParametersChanges()) {
                    $this->modified_tables[self::R_SIP] = true;
                }
                if ($this->pbxSettings->itHasSSHParametersChanges()) {
                    $this->modified_tables[self::R_SSH] = true;
                }
                if ($this->pbxSettings->itHasFirewallParametersChanges()) {
                    $this->modified_tables[self::R_FIREWALL] = true;
                }
                if ($this->pbxSettings->itHasWebParametersChanges()) {
                    $this->modified_tables[self::R_NGINX] = true;
                }
                if ($this->pbxSettings->itHasCronParametersChanges()) {
                    $this->modified_tables[self::R_CRON] = true;
                }
                if ($this->pbxSettings->itHasDialplanParametersChanges()) {
                    $this->modified_tables[self::R_DIALPLAN] = true;
                }
                if ($this->pbxSettings->itHasVoiceMailParametersChanges()) {
                    $this->modified_tables[self::R_VOICEMAIL] = true;
                }
                if ('PBXInternalExtensionLength' === $this->pbxSettings->key) {
                    $this->modified_tables[self::R_DIALPLAN] = true;
                    $this->modified_tables[self::R_SIP]      = true;
                }
                if ('PBXLicense' === $this->pbxSettings->key) {
                    $this->modified_tables[self::R_LICENSE] = true;
                    $this->modified_tables[self::R_NATS]    = true;
                }
                break;
            case Sip::class:
                $this->modified_tables[self::R_SIP]      = true;
                $this->modified_tables[self::R_DIALPLAN] = true;
                break;
            case SoundFiles::class:
                $this->modified_tables[self::R_DIALPLAN] = true;
                break;
            case PbxExtensionModules::class:
                $this->modified_tables[self::R_CRON] = true;
                break;
            default:
        }

        if ($count_changes === 0 && count($this->modified_tables) > 0) {
            // Начинаем отсчет времени при получении первой задачи.
            $this->last_change = time();
        }
    }

    /**
     * Apply changes
     *
     * @return void
     */
    private function startReload(): void
    {
        if (count($this->modified_tables) === 0) {
            return;
        }
        $delta = time() - $this->last_change;
        if ($delta < $this->timeout) {
            return;
        }

        foreach ($this->PRIORITY_R as $method_name) {
            $action = $this->modified_tables[$method_name] ?? null;
            if ($action === null) {
                continue;
            }
            if (method_exists($this, $method_name)) {
                $this->$method_name();
            }
        }

        foreach ($this->arrObject as $appClass) {
            $appClass->modelsEventNeedReload($this->modified_tables);
        }
        $this->modified_tables = [];
    }


    /**
     * Restarts gnats queue server daemon
     */
    public function reloadNats():void
    {
        $natsConf = new NatsConf();
        $natsConf->reStart();
    }

    /**
     * Clear cache pbx settings
     */
    public function clearCachePbxSettings():void
    {
        $this->pbxSettings->clearCache(PbxSettings::class);
    }

    /**
     * Reloads Asterisk dialplan
     */
    public function reloadDialplan(): void
    {
        PBX::dialplanReload();
    }

    /**
     * Reloads Asterisk manager interface module
     */
    public function reloadManager(): void
    {
        PBX::managerReload();
    }

    /**
     * Generates queue.conf and restart asterisk queue module
     */
    public function reloadQueues(): void
    {
        QueueConf::queueReload();
    }

    /**
     * Updates custom changes in config files
     */
    public function updateCustomFiles(): void
    {
        System::updateCustomFiles();
    }

    /**
     * Apply iptable settings and restart firewall
     */
    public function reloadFirewall(): void
    {
        IptablesConf::reloadFirewall();
    }

    /**
     *  Refresh networks configs and restarts network daemon
     */
    public function networkReload(): void
    {
        System::networkReload();
    }

    /**
     * Refresh IAX configs and reload iax2 module
     */
    public function reloadIax(): void
    {
        PBX::iaxReload();
    }

    /**
     * Refresh SIP configs and reload PJSIP module
     */
    public function reloadSip(): void
    {
        PBX::sipReload();
    }

    /**
     *  Refresh features configs and reload features module
     */
    public function reloadFeatures(): void
    {
        PBX::featuresReload();
    }

    /**
     * Restarts CROND daemon
     */
    public function reloadCron(): void
    {
        $cron = new CronConf();
        $cron->reStart();
    }

    /**
     * Restarts Nginx daemon
     */
    public function reloadNginx(): void
    {
        $nginxConf  = new NginxConf();
        $nginxConf->reStart();
    }

    /**
     * Configure SSH settings
     */
    public function reloadSSH(): void
    {
        $sshConf = new SSHConf();
        $sshConf->configure();
    }

    /**
     *  Reloads Asterisk voicemail module
     */
    public function reloadVoicemail(): void
    {
        PBX::voicemailReload();
    }

    public function timeoutHandler()
    {
        // Обязательная обработка.
        $this->last_change = time() - $this->timeout;
        $this->startReload();
    }

}

/**
 * Основной цикл демона.
 */
$workerClassname = WorkerModelsEvents::class;
if (isset($argv) && count($argv) > 1 && $argv[1] === 'start') {
    cli_set_process_title($workerClassname);
    try {
        $worker = new $workerClassname();
        $worker->start($argv);
    } catch (\Exception $e) {
        global $errorLogger;
        $errorLogger->captureException($e);
        sleep(1);
    }
}