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
The nowplaying command can now skip songs and send 'Player error: aborted' message so you can skip and nobody will know ;)  
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