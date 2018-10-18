# Ideas.md

[x] command desktop to instantly change path (context) to desktop
[x] command load to load the music files from current path
[] command spath to save the current directory path to settings.json
[] command play to start playing song from current songlist (none if no loaded)
[] command pause to ... pause song ofc
[] command fwd (112, 250) to skip forward a number of seconds
[] command rwd (num of s) to rewind a number of seconds
[x] command .. to go back a level
[x] command ls to list current directory
[x] command cd path to change directory
[x] command clear to remove all visual history

[] setting dropdown for resolution (league reference) + minified version
[] setting checkbox load music from saved path on app startup

- menubar stuff "https://electronjs.org/docs/tutorial/windows-taskbar"

settings json
{
  "window": {
    "size": [
      1280,
      720
    ]
  },
  "preferences": {
    "random": false,
    "volume": 5,
    "validMusicPath": null
  },
  "startup": {
    "loadSongs": false,
    "autoplay": false
  }
}