<?php
/**
 * Copyright © MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Alexey Portnov, 2 2020
 */
namespace MikoPBX\Core\Workers;

require_once 'globals.php';

use Phalcon\Exception;
use MikoPBX\Core\System\{BeanstalkClient, MikoPBXConfig, Notifications, Util};

class WorkerNotifyError extends WorkerBase
{
    private $queue = [];
    private $starting_point = 0;
    private $interval = 28800;

    /**
     * Наполняем очередь уведомлениями.
     */
    public function start()
    {
        $client = new BeanstalkClient('WorkerNotifyError_license');
        $client->subscribe('WorkerNotifyError_license', [$this, 'onLicenseError']);
        $client->subscribe('WorkerNotifyError_storage', [$this, 'onStorageError']);
        $client->subscribe('ping_'.self::class, [$this, 'pingCallBack']);

        while (true) {
            $client->wait();
        }
    }

    /**
     * Обработчик пинга. Тут же проверка необходимости оповещения.
     *
     * @param BeanstalkClient $message
     */
    public function pingCallBack($message):void
    {
        parent::pingCallBack($message);
        if (count($this->queue) > 0 && (time() - $this->starting_point) > $this->interval) {
            $this->sendNotify();
            $this->starting_point = time();
            $this->queue          = [];
        }
    }

    /**
     * Отправка уведомления об ошибке лицензии.
     */
    private function sendNotify()
    {
        $config = new MikoPBXConfig();
        $to     = $config->getGeneralSettings('SystemNotificationsEmail');
        if (empty($to)) {
            return;
        }
        $test_email = '';
        foreach ($this->queue as $text_error => $section) {
            if (empty($text_error)) {
                continue;
            }
            if (Util::isJson($text_error)) {
                $data       = json_decode($text_error, true);
                $test_email .= "<hr>";
                $test_email .= "{$section}";
                $test_email .= "<hr>";
                foreach ($data as $key => $value) {
                    $test_email .= "{$key}: {$value}<br>";
                }
                $test_email .= "<hr>";
            } else {
                $test_email .= "$text_error <br>";
            }
        }

        Notifications::sendMail($to, 'Askozia Errors', $test_email);
    }

    /**
     * @param BeanstalkClient $message $message
     */
    public function onLicenseError($message)
    {
        $body = $message->getBody();
        if (empty($body)) {
            return;
        }
        // Наполняем массив уникальными даными.
        $this->queue[$body] = 'License error:';
    }

    /**
     * @param BeanstalkClient $message $message
     */
    public function onStorageError($message)
    {
        $body = $message->getBody();
        if (empty($body)) {
            return;
        }
        $mail_body = '';
        if (is_array($body)) {
            foreach ($body as $key => $val) {
                $mail_body .= "$key: $val <br>";
            }
        } else {
            $mail_body = trim($body);
        }
        // Наполняем массив уникальными даными.
        $this->queue[$mail_body] = 'Storage error:';
    }

}


// Start worker process
$workerClassname = WorkerNotifyError::class;
if (isset($argv) && count($argv) > 1 && $argv[1] === 'start') {
    cli_set_process_title($workerClassname);
    try {
        $worker = new $workerClassname();
        $worker->start();
    } catch (\Exception $e) {
        global $g;
        $g['error_logger']->captureException($e);
        Util::sysLogMsg("{$workerClassname}_EXCEPTION", $e->getMessage());
    }
}