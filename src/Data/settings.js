const { existsSync, writeFileSync } = require('fs');
const { fileLog, consoleLog } = require('./Log');

const fileVersion = '1.0';

const checkSettingsFiles = () => {
    if (!existsSync('./config/settings.json')) {
        consoleLog('[INFO] The config file for server settings does not exist, creating new one...');
        const data = {
            fileVersion: fileVersion,
            guild: {}
        }
        writeFileSync('./config/settings.json', JSON.stringify(data, null, 4));
    }
    else { // Check if the settings file supports the new settings
        const settingsFile = require('../../config/settings.json');
        if (settingsFile.fileVersion != fileVersion) {
            consoleLog('[WARN] The settings.json file for server settings is outdated! Exiting...');
            process.exit(1);
        }
    }
    fileLog('[INFO] Settings file checked!');
}

module.exports = checkSettingsFiles
