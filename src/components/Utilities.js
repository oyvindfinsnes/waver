const globalShortcut = require('electron').remote.globalShortcut;
const fs = require('fs');
const path = require('path');

class Utilities {

  constructor() {
    this.extensions = ['flac', 'mp4', 'm4a', 'mp3', 'ogg', 'webm', 'wav'];
  }

  removeAllAfterWordInPath(word, path) {
    // Get everything after and including "word"
    const match = new RegExp(word + '(.*)').exec(path);

    // Access capture group 1, which excludes "word", and replace with nothing
    // (effectively just removes everything after the specified word)
    const regex = new RegExp(match[1]);
    let tempPath = path.replace(regex, '');

    // Remove \ at the end of the path, since RegExp is acting weird and
    // not removing it (even though it is matched)
    const tempArr = tempPath.split('\\');
    tempArr.pop();
    tempPath = tempArr.join('\\');

    return tempPath;
  }

  registerShortcut(shortcut, fn) {
    // Helper function to easily register one of the media shortcuts from anywhere
    // when you have the specific function you want it to run

    //medianexttrack mediaplaypause mediaprevioustrack temp

    // If the shortcut didn't register or the function is not a function, this
    // returns some falsy value that can be tested with if (!result)
    return globalShortcut.register(shortcut, () => {
      if (typeof fn === 'function') {
        fn();
      }
    });
  }

  testDirForSupportedAudioFiles(folderPath) {
    const extensions = this.extensions;
    const files = fs.readdirSync(folderPath);

    if (!files) {
      return false;
    }

    // Filter the array by looping through extensions and keeping the files
    // that are supported
    const resultFiles = files.filter(file => {
      const fileExt = path.extname(file);
      for (let extension of extensions) {
        // If any extension match, return true to keep element
        if (fileExt === '.' + extension) {
          return true;
        }
      }
      // No matches if loop passed all the way through
      return false;
    });
    return resultFiles;
  }
}

module.exports = new Utilities();