<?php

namespace Pheanstalk\Command;

use Pheanstalk\Contract\ResponseParserInterface;
use Pheanstalk\YamlResponseParser;

/**
 * The 'stats' command.
 *
 * Statistical information about the system as a whole.
 */
class StatsCommand extends AbstractCommand
{
    public function getCommandLine(): string
    {
        return 'stats';
    }

    public function getResponseParser(): ResponseParserInterface
    {
        return new YamlResponseParser(
            YamlResponseParser::MODE_DICT
        );
    }
}