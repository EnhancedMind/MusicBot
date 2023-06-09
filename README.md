# Music Bot
A complete code to download for a Discord Music Bot  
-> Just a discord music bot with a lot of music functionality, no excess moderation, just music :)  
-> Supports YouTube and Soundcloud (not soundcloud playlists)  
-> Supports use of cookies (bypass age restriction)  
-> Automatically skips music off-topic segments with [SponsorBlock](https://sponsor.ajay.app/)  
-> type `-help` or `@botmention help` in chat to learn more when you set up the bot  

Inspired by [jagrosh/MusicBot](https://github.com/jagrosh/MusicBot)  
Uses SponsorBlock data licensed used under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) from https://sponsor.ajay.app/.  
  
## Configuration
Copy the `config.json.example` in the config folder and rename it to `config.json`  
```json
{
    "ignoreECONNRESET": true,
    "terminateOnUncaughtException": true,
    "bot": {
        "token": "put your bot token here",
        "prefix": "*",
        "ignoreMessageEndingWithPrefix": false,
        "owner_id": "put your discord id here"
    },
    "status": {
        "status": "online",
        "game": "made by EnhancedMind ❤️"
    },
    "emoji": {
        "success": ":notes:",
        "info": ":bulb:",
        "warning": ":warning:",
        "error": ":no_entry_sign:",
        "loading": ":watch:",
        "searching": ":mag_right:"
    },
    "response": {
        "notValidCommand": false,
        "missingArguments": "Missing arguments. Please use `{prefix}help` for more information.",
        "invalidPermissions": "You do not have the permission to use this command.",
        "invalidNumber": "Please provide a valid number.",
        "noChannel": "You must be in a voice channel.",
        "wrongChannel": "You must be in the same voice channel as I am.",
        "afkChannel": "You can't be in a AFK voice channel.",
        "noMusic": "No music is playing on this server."
    },
    "player": {
        "playlistFolderPath": "Playlists",
        "stayInChannel": true,
        "maxTimeSeconds": 0,
        "downloaderMaxTimeSeconds": 1800,
        "aloneTimeUntilStopSeconds": 180,
        "forbiddenKeywords": [ "forbiddenKeyword1", "forbiddenKeyword2" ],
        "updateIntervalMiliseconds": 7500,
        "loudnessNormalization": false,
        "bitrate": "96k",
        "selfDeaf": false,
        "debug": false,
        "library": {
            "player": "play-dl",
            "downloader": "ytdl-core",
            "info": "ytdl-core"
        },
        "sponsorBlock": {
            "enabled": true,
            "clientUUID": "your client uuid v4",
            "minSegmentLengthSeconds": 5,
            "maxStartOffsetSeconds": 3,
            "maxEndOffsetSeconds": 4
        },
        "youtubeCookie": "a=1; b=2; c=3...  LEAVE THIS BLANK IF NOT USED!!!!!!!"
    },
    "logs": {
        "resetLogOnStart": false,
        "logToFile": false,
        "timeFormat": "en-US"
    }
}
```
<br>

- `ignoreECONNRESET`: whether to ignore ECONNRESET errors or not - **only for advanced users, not recommended to change, may break functionality**  
- `terminateOnUncaughtException`: whether to terminate the process on uncaught exception or not - **only for advanced users**  
<br>

- `bot.token`: the token of your discord bot you can get from [Discord Developers page](https://discord.com/developers/applications)  
- `bot.prefix`: the prefix which will be used for your bot's commands  
- `bot.ignoreMessageEndingWithPrefix`: whether to ignore messages (commands) ending with the prefix or not (useful for * and prefixes like this that are used for markdown)  
- `bot.ownerID`: your discord user id you can get by right clicking user on discord after enabling developer mode  
<br>

- `status.status`: the status of the bot - online / idle / dnd / invisible  
- `status.game`: the game status the bot will show. can be changed with a command  
<br>

- `emoji.success`: the emoji that will be used for success messages  
- `emoji.info`: the emoji that will be used for info messages  
- `emoji.warning`: the emoji that will be used for warning messages  
- `emoji.error`: the emoji that will be used for error messages  
- `emoji.loading`: the emoji that will be used for loading messages  
- `emoji.searching`: the emoji that will be used for searching messages  
<br>

- `response.notValidCommand`: whether to send a message when the user uses a command that doesn't exist  
- `response.missingArguments`: the message that will be sent when the command is missing arguments  
- `response.invalidPermissions`: the message that will be sent when the user does not have the permission to use the command  
- `response.invalidNumber`: the message that will be sent when the user provides an invalid number  
- `response.noChannel`: the message that will be sent when the bot is not in a voice channel, but the command requires it  
- `response.wrongChannel`: the message that will be sent when the user is not in the same voice channel as the bot, but the command requires it  
- `response.afkChannel`: the message that will be sent when the user is in a AFK voice channel, but the user tries to play music  
- `response.noMusic`: the message that will be sent when the user tries to use a command that requires music to be playing, but there is no music playing  
<br>

- `player.playlistFolderPath`: the folder where the playlists will be saved  
- `player.stayInChannel`: whether to stay in the voice channel after the queue is empty or not  
- `player.maxTimeSeconds`: the maximum length of song that will be played - 0 for unlimited  
- `player.downloaderMaxTimeSeconds`: the maximum length of song that can be nightcored or slowed  
- `player.aloneTimeUntilStopSeconds`: the time in seconds until the bot leaves the voice channel if there isn't anyone in the channel. 0 to leave immediately, -1 to leave when queue ends and player stops when the channel is empty or never when loop is enabled.  
- `player.forbiddenKeywords`: song titles that will not be played if they contain any of the keywords  
- `player.updateIntervalMiliseconds`: the interval in milliseconds that will be used to update the nowplaying command (not recommended to go below 7500)  
- `player.loudnessNormalization`: whether to normalize the loudness of the songs (not recommended, currently working only for downloaded songs)  
- `player.bitrate`: the bitrate that will be used for ffmpeg for streaming music  
- `player.selfDeaf`: whether to deafen the bot or not  
- `player.debug`: whether to show audioplayer debug messages or not  
- `player.library.player`: the library that will be used for streaming music (music player) - play-dl / ytdl-core  
- `player.library.downloader`: the library that will be used for downloading music (nightcore and slowed cmds) - play-dl / ytdl-core  
- `player.library.info`: the library that will be used for getting song info - ytdl-core only for now 
- `player.sponsorBlock.enabled`: whether to enable the use of SponsorBlock or not  
- `player.sponsorBlock.clientUUID`: the client UUID that will be used for getting the SponsorBlock data from the API  
- `player.sponsorBlock.minSegmentLengthSeconds`: the minimum length of a segment that will skipped  
- `player.sponsorBlock.maxStartOffsetSeconds`: the maximum start offset of a segment that will be skipped (e.g. if the segment starts 5 seconds into the video but the max start offset is 3, it will not be skipped)  
- `player.sponsorBlock.maxEndOffsetSeconds`: same as above but for the end of the video  
- `player.youtubeCookie`: the cookie that will be used for youtube requests (leave blank if not used). To obtain it visit https://github.com/play-dl/play-dl/discussions/34  
<br>

- `logs.resetLogOnStart`: whether to clear the session log on start or continue at the end of the file  ´
- `logs.logToFile`: whether to log to a file or only to the console  
- `logs.timeFormat`: the time format that will be used for the logs - [en-US](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat)  
<br><br>

## Instalation
To use the project you will need:  
[Node JS v16.11 or newer](https://nodejs.org/en/)  
<br>

Download the project either from main branch or from the [releases page](https://github.com/EnhancedMind/MusicBot/releases/latest).  
Extract it somewhere on your computer and follow the configuration steps in the bot section, the others are for more advanced users.  
Open command prompt in the folder where you extracted the project and install the dependencies using the following command:
`npm i`
After that is done, you can start the bot using the following command:
`npm start`
<br>

If you want to use the bot 24/7, you will need to host it somewhere. You can use some online hosting services or for example a Raspberry Pi (model 4 is plenty fast for this).  
You can also use the attached Dockerfile to build a docker image and run it in a container.  

## If you have any questions, feel free to ask.
<br>
  
### Please do not withdraw the license and keep the credits on this project.
### Made with ❤️ by EnhancedMind  
