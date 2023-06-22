# Version 0.5.0
Added auto skipping of music off-topic segments using SponsorBlock data licensed used under CC BY-NC-SA 4.0 from https://sponsor.ajay.app/.  
Added support for cookies  
Changed the config time variables to have the seconds/milliseconds suffix in their name  
Added sponsorblock command to enable/disable skipping of music off-topic per guild  
Added option to config to set the maximum length of song that can be nightcored or slowed because the song has to be downloaded to local storage  
Added option to config to set ffmpeg bitrate  
Fixed the nowplaying command so it doesn't crash when the bot is in a voice channel but the queue is empty  
Fixed README links  
Added support for soundcloud tracks (playlists are not supported)  
Added makelistfromqueue command to create a local playlist from the queue  
Fixed the bot sometimes showing 'ghost' active connections in the about command when they are already destroyed  
Fixed the reaction collectors to remove all the reactions when it is triggered before all the reactions are placed  
Fixed the bot crashing when selecting attached playlist in the play command before the cancel reaction is placed  
Added unhandledRejection handler for discordAPIErrors unknown message to prevent the bot from crashing in edge cases  
Updated to use the new discord naming system. Will use displayName instead of username when discord.js stable version updates  
Fixed shuffleing local playlists that are added to the end of the queue  
Updated the nowplaying command to show the next song in the queue  
Moved the playerdebug command to the admin category as the music category is full (help menu embed field limit)  

# Version 0.4.3
Added the lyrics command  
Updated the displayed syntax for skip command in help menu (skip to position)  
Fixed the play command so user can't use it to resume when he is in a wrong channel  
Fixed the play command so if a URL of video with attached playlist is passed, multiple clicks on the reaction won't cause it to load the playlist multiple times  
Fixed the play command so if there is a active connection for the guild but the queue is empty, the response will say to begin playing instead of added to queue at position 0 when the command is used  
Added an 'alias' for 'play top' as 'play next' as it is more intuitive  
Fixed the queue command so it doesn't count the currently playing song into the total queue length  
Fixed the slowed command responses to say slowed and not nightcore  
Updated the displayed syntax for the slowed command in help menu (slowed instead of slow)  
Fixed the forceprune command so multiple clicks on the reaction won't cause it to fetch (and possibly delete) the messages multiple times  
Fixed code for some response edits (search command) not stopping the code execution when the response is deleted  

# Version 0.4.2
About command now displays the discord.js version  
About command now displays the number of active connections  
The bot can now also be mentioned in the command so prefix doesn't have to be used and remembered  
When play-dl or ytdl-core throws an error in the player, the exception is now handled so the bot now logs it and sends the error message to the default channel for the guild  
Changed the FFmpeg output format in player from wav to opus  
Changed the FFmpeg options to set the bitrate to 96kbps and the codec to libopus  
Fixed the aloneTimeUntilStop to never leave when the number is negative, not <= 0  
Updated README.md for aloneTimeUntilStop  
Added a error catcher the the save command so it doesn't crash when DM can't be sent (bot is blocked by user or user has DMs disabled)  
Updated discord.js to version 14.11.0  
Fixed the activity not showing due to the new discord.js version  
Updated the last restart to be the localeString set in config.json  
The skipping now force stops the player instead of unpipeing it's resource  
The shuffle command now doesn't say "your entries" as it shuffles the entire queue  
The shuffle command can now be used by bot owner even when he isn't in the voice channel  
Updated the installation instructions in README.md  

# Version 0.4.1
Updated discord.js to version 14.9.0  
Changed the code to accomodate for the new discord.js version  
Updated discord.js/voice to version 0.16.0  
Updated ffmpeg-static to version 5.1.0  
Updated yt-search to version 2.10.4  
Updated libsodium-wrappers to version 0.7.11  
Forgot to update config.json.example in 0.4.0, now it's updated  
Removed unused requirements from join command  
The prune command was updated to work with discord.js 14  
Fixed bot occasionally crashing when sending queue command soon after joining the voice channel as the embed description was an empty string unacceptable by the discord API  
Updated paginator so buttons are not sent when there is only one page  
Fixed the nowplaying command so it doesn't crash when the message is deleted  
Updated the reaction collector so they don't crash when the message is deleted (discord.js v14 changed stuff)  
Fixed response edits and deletions so they don't crash when the message is deleted  
Fixed removing reactions so they don't crash when the message is deleted  

# Version 0.4.0
The commands requiring elevated permissions can now be used by bot owner even without the elevated permissions  
Command category folders now start with number and they are sorted by that number  
The prune commands now say Deleting messages instead of Clearing messages  
Updated ytdl-core to version 4.11.4  
The debug command can now send both logs and config files  
Added the option to use play-dl instead of ytdl-core for player and downloader (nightcore and slowed cmds), info is ytdl-core only for now  
Changed the required permission to manage channels for music commands that require elevated permissions  
Added the descriptions for nightcore and slowed commands  
The nightcore and slowed commands and their associated downloader now listen for stream errors and handle them  
The nightcore and slowed commands now don't crash when invalid number is passed as argument  
Fixed the ```<arg>``` and [arg] syntax in the help menu  
Added verification to the nowplaying command when it creates embed description so line.repeat can't be less than 0  
Playling local playlist now doesn't require typing the full name, the start of the name is enough  
The playlists command now responds that no playlists were found  
Changed the format of the playlists command response to be consistent with other commands  
If aloneTimeout is set to less than 0, the bot will not leave the voice channel when left alone  
Updated readme  

# Version 0.3.0
If temp folder doesn't exist, it will be created now  
Added persistent to the volume command syntax displayed in help menu  
Pause command now displays the correct prefix  
Updated the debug command so only the start of the filename is needed  
Changed playerdebug to not show FFmpeg options as array but as string like in a console  
Added the prune command which deletes only the messages from the bot and the messages used to invoke the bot  
Added the forceprune command to remove all messages from the text channel  
Updated the description of the play command  
Modified the skip command to not skip if it has arguments that aren't for skipping to specific position  
Added poweroff alias to shutdown command  
Nowplaying debug mode now only works for bot owner  
The shutdown command now also destroys all the connections, ends all nowplaying updaters and says it's shutting down in playing guilds before it destroys the client  
Fixed the skipto command so it skips to the correct position  
Fixed the nowplaying command (in the data/queue.js player handler) so it doesn't stack updaters for the same guild with each join of the bot  
Fixed the nowplaying command so it diplays the correct prefix when music is paused  
Removed this.on('error') as it was not needed and was a hacky fix in Client.js  
Moved the application message after initlog in Client.js  
The bot now logs when error and warn events are emitted by Discord  
Fixed logging objects and multiple data to the logfile  
Changed the owner to ownerID in the config file  
Changed rstLogOnStart to resetLogOnStart in the config file  
Added new config option to only log to console and ignore sessionLog file  
Added new config option to set other time format  
Added new config option to ignore messages ending with the prefix, which was forced previously  
Polished the grammar  
Updated ytdl-core to version 4.11.3  

# Version 0.2.4
Updated discord.js/opus to 0.9.0  
Added a very hacky solution to the issue of the bot not being able to play songs after a while caused by ECONNRESET errors.  

# Version 0.2.3
Updated discord.js/voice to 0.15.0  
Updated discord.js to 13.14.0  

# Version 0.2.2
Updated ytdl-core to version 4.11.2  

# Version 0.2.1
Fixed whole process crashing on ytdl error, now it should be handled and interpreted as player-ytdl error  
Added this.on('error') as a hacky fix to Client.js to catch errors from the player  

# Version 0.2.0
When message edit on bot restart fails another message will be sent instead  
Songs now should have normalized volume using FFmpeg  
The audio volume normalization is now configurable in the config file  
Added grab and yoink aliases to the save command  
Nowplaying command no longer uses the skip command to skip songs due to issues with checking the voice state and changing the skipping mechanism  
The nowplaying command now requires the user to be in the same voice channel as the bot  
The nowplaying command can now skip songs and send 'Player error: aborted' message so you can skip and nobody will know ;) (by reacting with ⏩)  
Added the bassboost command  
Added the seek command  
Added the skip command with abort message  
Added the join command  
Added the move command  
Added the playerdebug command  
Added the nightcore command  
Added the slowed command  
Added the leavecleanup command  
Added the removedupes command  

# Version 0.1.1
Updated code that will be deprecated in discord.js v14  
Solved player crashing on error  
Solved crashing on errors on loading age restricted videos  
Solved crashing on restart command as connections are destroyed but not updated  
Solved logger crashes with non-stringifiable data  
Forgot the rest...  

# Version 0.1.0
The beginning of it all.  
