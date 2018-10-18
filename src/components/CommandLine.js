const app = require("electron").remote.app;
const os = require("os");
const fs = require("fs");
const path = require("path");
const Utilities = require("./Utilities");
const CommandLog = require("./CommandLog");
const SongList = require("./SongList");

class CommandLine {

  constructor() {

    this.elemInput = document.querySelector("#cmd-input");
    this.elemPath = document.querySelector("#cmd-path");

    this.currentPath = app.getAppPath();
    this.currentCommand = null;

    this.init();

  }

  init() {

    const { elemInput } = this;

    elemInput.addEventListener("keyup", e => {

      // Enter event listener to process input
      if (e.key === "Enter") this.handleInput();

    });

    elemInput.addEventListener("keydown", e => {

      // Up and down arrow goes through the input history and changes command
      // line value
      // keydown is used to prevent default behavior of up/down
      if (e.key === "ArrowUp") {

        e.preventDefault();
        CommandLog.incrementIndex();
        elemInput.value = CommandLog.getHistory();

      } else if (e.key === "ArrowDown") {

        e.preventDefault();
        CommandLog.decrementIndex();
        elemInput.value = CommandLog.getHistory();

      } else if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") {

        // This clause is used to reset the index whenever the user types or
        // deletes anything, but preserves index for when user navigates through
        // text with left/right arrow
        CommandLog.setIndex(-1);

      }

    });

    // Click listener on command-line-container to set focus on input
    const container = document.querySelector(".commandline");
    container.addEventListener("click", () => elemInput.focus());

    // Initial update of the current path
    this.updateDOMPath();

  }

  handleInput() {

    // Get users command, store it and clear the commandline
    const cmd = this.elemInput.value.trim();
    this.currentCommand = cmd;
    this.elemInput.value = "";


    // Ignore if only whitespace (trimmed beforehand) or empty commandline
    if (!cmd) return;

    CommandLog.addHistory(cmd);
    CommandLog.updateDOM({ "type": "input", "content": cmd });

    this.processCommand();

  }

  processCommand() {

    // cmdType is only the first string from cmdArr because the function for each
    // command will take care of any other parameters
    const cmdArr = this.currentCommand.split(" ");
    const cmdType = cmdArr[0].toLowerCase();
    let result;

    // Catalog to easily look up and run appropriate command
    const cmdLookup = {
      "..": () => this.cmdBack(cmdArr),
      "cd": () => this.cmdChangeDir(cmdArr),
      "clear": () => this.cmdClear(cmdArr),
      "ds": () => this.cmdPathDesktop(cmdArr),
      "load": () => this.cmdLoad(cmdArr),
      "ls": () => this.cmdListDir(cmdArr),
      "spath": () => this.cmdSavePath(cmdArr),
      "vol": () => this.cmdVolume(cmdArr)
    }

    cmdLookup.hasOwnProperty(cmdType)
      // Run function of correct type if it exists in the look-up ...
      ? result = cmdLookup[cmdType]()
      // .. if not, return an error message
      : result = {
        "type": "error",
        "content": `Command "${cmdType}" does not exist`
      }

    // Update the visual command history at the end of processing
    CommandLog.updateDOM(result);

  }

  cmdBack(cmdArr) {

    if (cmdArr.length > 1) {

      // .. command only takes one keyword (..)
      return {
        "type": "error",
        "content": `Too many arguments passed for command "${cmdArr[0]}"`
      }

    } else {

      // Removes the last segment of the current path (go one segment back)
      const tempPath = this.currentPath.split("\\");
      tempPath.pop();
      this.currentPath = tempPath.join("\\");
      this.updateDOMPath();

      return {
        "type": "progress",
        "content": `Changed current path to "${this.currentPath}"`
      }

    }

  }

  cmdChangeDir(cmdArr) {

    if (cmdArr.length > 2) {

      // CD command only takes one keyword (cd) and one parameter (path)
      return {
        "type": "error",
        "content": `Too many arguments passed for command "${cmdArr[0]}"`
      }

    } else if (cmdArr.length === 1) {

      return {
        "type": "error",
        "content": `No path specified for command "${cmdArr[0]}"`
      }

    } else {

      // cd-command supports multiple levels of navigation in the same
      // argument. RegExp ensures support for both / and \ in the path
      const pathArr = cmdArr[1].split(/[\/\\]/);
      let tempPath = this.currentPath;

      for (let segment of pathArr) {

        try {

          // Read the current path (which is added onto for each loop iteration)
          // and get access to all files/dirs contained here
          const contentArr = fs.readdirSync(tempPath);
          segment = segment.toLowerCase();
          let noMatches = false;

          // Loop through every file/dir in current path, and confirm what the
          // user entered as segment actually exists
          for (let fileOrDir of contentArr) {

            fileOrDir = fileOrDir.toLowerCase();
            const result = segment.includes(fileOrDir);

            if (result) {

              // If the segments match up, add it to the tempPath and check next
              // segment of the parameter
              noMatches = false;
              tempPath += "\\" + fileOrDir;

              break;

            } else noMatches = true

          }

          if (noMatches) {

            // If any of the segments are wrong/does not exist, return error
            return {
              "type": "error",
              "content": `No file or directory named "${segment}"`
            }

          }

        } catch (e) {

          // If any error occurs, something went wrong with either the pathname
          // or the readdir function (assuming all other code in try is correct)
          return {
            "type": "error",
            "content":
              `Could not read from path "${tempPath}". If error persists,${" "}
              please restart the application`
          }

        }

      }

      // At the end of the whole check, update the global path
      this.currentPath = tempPath;
      this.updateDOMPath();

      return {
        "type": "progress",
        "content": `Changed current path to "${tempPath}"`
      }

    }

  }

  cmdClear(cmdArr) {

    if (cmdArr.length > 1) {

      // Clear command only takes one keyword (clear)
      return {
        "type": "error",
        "content": `Too many arguments passed for command "${cmdArr[0]}"`
      }

    } else {

      CommandLog.clearDOMHistory();

      return {
        "type": "empty"
      }

    }

  }

  cmdPathDesktop(cmdArr) {

    if (cmdArr.length > 1) {

      // Desktop command only takes one keyword (desktop)
      return {
        "type": "error",
        "content": `Too many arguments passed for command "${cmdArr[0]}"`
      }

    } else {

      const tempPath = app.getAppPath();
      this.currentPath = Utilities.removeAllAfterWordInPath("Desktop", tempPath);
      // Update the visual path and return result of executed task
      this.updateDOMPath();

      return {
        "type": "progress",
        "content": `Changed current path to "${this.currentPath}"`
      }

    }

  }

  cmdLoad(cmdArr) {

    if (cmdArr.length > 1) {

      // load command only takes one keyword (load)
      return {
        "type": "error",
        "content": `Too many arguments passed for command "${cmdArr[0]}"`
      }

    } else {

      const supportedFiles = Utilities.testDirForSupportedAudioFiles(
        this.currentPath
      );

      if (!supportedFiles) {

        // If the result is falsy, something went wrong with either the pathname
        // or the readdir function (because an empty array will not pass the if)
        return {
          "type": "error",
          "content":
            `Could not read from path "${this.currentPath}". If error${" "}
            persists, please restart the application`
        }

      }

      if (supportedFiles.length > 0) {

        // If the result array has at least 1 element, update the header with
        // current path loaded and process files (song paths)
        SongList.setCurrentMusicPath(this.currentPath);
        SongList.loadSongs(supportedFiles);

        return {
          "type": "progress",
          "content": 'Loading songs ...'
        }

      } else {

        const outputArr = [
          'Error: No supported file types found. Supported file types are:',
          ...Utilities.extensions
        ];

        return {
          "type": "error",
          "content": CommandLog.createListNode(outputArr)
        }

      }

    }

  }

  cmdListDir(cmdArr) {

    if (cmdArr.length > 1) {

      // ls command only takes one keyword (ls)
      return {
        "type": "error",
        "content": `Too many arguments passed for command "${cmdArr[0]}"`
      }

    } else {

      try {

        // Read the current path and get access to all files/dirs
        const contentArr = fs.readdirSync(this.currentPath);
        const outputArr = ["Files and directories: ", ...contentArr]

        return {
          "type": "progress",
          "content": CommandLog.createListNode(outputArr)
        }

      } catch (e) {

        // If any error occurs, something went wrong with either the pathname
        // or the readdir function (assuming all other code in try is correct)
        return {
          "type": "error",
          "content":
            `Could not read from path "${this.currentPath}". If error${" "}
            persists, please restart the application`
        }

      }

    }

  }

  cmdSavePath(cmdArr) {

    if (cmdArr.length > 1) {

      // spath command only takes one keyword (spath)
      return {
        "type": "error",
        "content": `Too many arguments passed for command "${cmdArr[0]}"`
      }

    } else {

      const validDirectoryPath = SongList.getCurrentMusicPath();

      if (!validDirectoryPath) {

        return {
          "type": "error",
          "content": `No valid music directory is loaded`
        }

      } else {

        // Read from the settings.json file
        const tempPath = path.join(__dirname, "../settings.json");
        const settingsData = require(tempPath);

        if (!settingsData) {

          // Something might go wrong with either the pathname or the require
          return {
            "type": "error",
            "content":
              `Could not read from settings. If error persists, please${" "}
              restart the application`
          }

        }

        try {

          settingsData.preferences.validMusicPath = validDirectoryPath;
          const output = JSON.stringify(settingsData);

          fs.writeFileSync(tempPath, output, "utf8");

          return {
            "type": "progress",
            "content": `Successfully saved ${validDirectoryPath} to settings`
          }

        } catch (e) {

          // Something might go wrong in writing to the file
          return {
            "type": "error",
            "content":
              `Could not save the new path in settings. If error persists,${" "}
              please restart the application`
          }

        }

      }

    }

  }

  cmdVolume(cmdArr) {

    if (cmdArr.length > 2) {

      // volume command only takes one keyword (volume) and one argument (number)
      return {
        "type": "error",
        "content": `Too many arguments passed for command "${cmdArr[0]}"`
      }

    } else if (cmdArr.length === 1) {

      return {
        "type": "error",
        "content": `No volume passed for command "${cmdArr[0]}"`
      }

    } else {

      const volumeAsNumber = parseInt(cmdArr[1]);
      // Check if its 0 to avoid math error divide-by-zero
      // JS-Audio volume goes from 0 - 1.0, so divide user input by 100
      const volume = volumeAsNumber === 0 ? 0 : volumeAsNumber / 100;

      SongList.setVolume(volume);

      return {
        "type": "progress",
        "content": `Volume set to ${volumeAsNumber}/100`
      }

    }

  }

  updateDOMPath() {

    const { elemPath } = this;

    // Get and format the username and hostname
    const name = os.userInfo().username + "@" + os.hostname().toUpperCase();
    // Make a textnode with the concatenated name
    const nameNode = document.createElement("p");
    nameNode.textContent = name;

    // Replace everything before "desktop" with "~" in path
    const regex = new RegExp(".+?(?=Desktop)");
    const tempPath = this.currentPath.replace(regex, "~\\");
    // Make a text node of the formatted path
    const pathNode = document.createElement("p");
    pathNode.textContent = tempPath;

    // Clear the path container before appending new elements
    elemPath.innerHTML = "";
    // Append both nodes to the path container element
    elemPath.appendChild(nameNode);
    elemPath.appendChild(pathNode);

  }

}

module.exports = new CommandLine();