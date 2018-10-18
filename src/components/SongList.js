const fs = require("fs");
const os = require("os");
const path = require("path");
const CommandLog = require("./CommandLog");

class SongList {

  constructor() {

    this.elemHeader = document.querySelector(".songlist-header");
    this.elemList = document.querySelector(".song-list");
    this.elemFooter = document.querySelector(".songlist-footer");

    this.currentMusicPath = null;
    this.currentSongs = null;
    this.songPlaying = {
      "element": null,
      "index": null
    };
    this.volume = 0.1;
    this.playmodeRandom = false;

    this.init();

  }

  init() {

    this.updateHeader();
    this.updateFooter();

  }

  setCurrentMusicPath(path) {

    this.currentMusicPath = path;
    this.updateHeader();

  }

  getCurrentMusicPath() {

    return this.currentMusicPath;

  }

  setVolume(num) {

    this.volume = num;

    if (this.songPlaying.element !== null) {

      this.songPlaying.element.volume = this.volume;

    }

    this.updateFooter();

  }

  loadSongs(songArr) {

    this.currentSongs = songArr;

    this.renderSongs();

    /* // logic to render songs in the list with an offset of +/- 10 elements or so
    const songPath = path.join(this.currentMusicPath, this.currentSongs[0]);
    this.songPlaying.element = new Audio(songPath);

    // Update with volume and start playing
    this.songPlaying.element.volume = this.volume;
    this.songPlaying.element.play(); */

  }

  renderSongs() {

    let totalSongs = this.currentSongs.length;
    const songlist = this.currentSongs;
    let songNodes = [];

    for (let i = 0; i < totalSongs; i++) {

      // Create a temporary path and audio element for the current song
      // This is mainly to get duration
      const tempPath = path.join(this.currentMusicPath, songlist[i]);
      const tempAudio = new Audio(tempPath);

      // Listener needed to decrement totalSongs if a song can't be loaded
      // so that length comparison and sorting works at the end
      tempAudio.addEventListener("error", () => {

        totalSongs--;
        // User is informed within command log
        CommandLog.updateDOM({
          "type": "error",
          "content": `Song "${this.currentSongs[i]}" could not be loaded`
        });

      });

      // Listener needed to wait for metadata to load (for duration)
      tempAudio.addEventListener("loadedmetadata", () => {

        // Run helper function to transform song info into a new node
        const node = this.createSongNode(songlist[i], tempAudio.duration);
        // Push every node into a list
        songNodes.push(node);

        // Promises execute asynchronously, so when metadata loads for every
        // song, check if songNodes length is the same as total songs the user
        // loaded from folder to determine when all have loaded
        if (songNodes.length === totalSongs) {

          // If the lengths match up, sort the elements and append them all to
          // the DOM
          songNodes.sort((a, b) => {
            const aCtn = a.innerHTML;
            const bCtn = b.innerHTML;
            return aCtn == bCtn ? 0 : (aCtn > bCtn ? 1 : -1);
          });

          for (let node of songNodes) this.elemList.appendChild(node);

          CommandLog.updateDOM({
            "type": "progress",
            "content": `${songNodes.length} / ${this.currentSongs.length} songs 
              loaded, ${this.currentSongs.length - songNodes.length} missed`
          });

        }

      });

    }

  }

  createSongNode(songPath, durationRaw) {

    // Remove the extension name from song path
    const ext = path.extname(songPath);
    const songWithoutExt = songPath.replace(ext, "");
    // Create a node for the name
    const name = document.createElement("p");
    name.textContent = songWithoutExt;

    // Format the song duration
    const h = Math.floor(durationRaw / 3600);
    const m = Math.floor((durationRaw - (h * 3600)) / 60);
    let s = Math.round(durationRaw - (h * 3600) - (m * 60));
    // Pad the seconds with 0 if single digit
    s < 10 ? s = `0${s}` : s;
    // Make a string of either h:m:s or m:s if there is no hour
    const timeString = h === 0 ? `${m}:${s}` : `${m}:${m}:${s}`;
    // Create node for the song duration
    const duration = document.createElement("p");
    duration.textContent = timeString;

    // Create a new element with a class and title
    const songNode = document.createElement("span");
    songNode.setAttribute("class", "song-container");
    // Custom data-title is made to be used as a tooltip
    songNode.setAttribute("data-title", songWithoutExt);

    // Append the 2 nodes to the song container
    songNode.appendChild(name);
    songNode.appendChild(duration);

    return songNode;

  }

  updateHeader() {

    if (this.currentMusicPath) {

      const { elemHeader } = this;

      // Get and format the username and hostname
      const name = os.userInfo().username + "@" + os.hostname().toUpperCase();
      // Make a textnode with the concatenated name
      const nameNode = document.createElement("p");
      nameNode.textContent = name;

      // Replace everything before "desktop" with "~" in path
      const regex = new RegExp(".+?(?=Desktop)");
      const path = this.currentMusicPath.replace(regex, "~\\");
      // Make a text node of the formatted path
      const pathNode = document.createElement("p");
      pathNode.textContent = path;

      const spanNode = document.createElement("span");
      spanNode.textContent = "Path:";

      // Clear the header
      elemHeader.innerHTML = "";

      // Append all nodes to the header
      elemHeader.appendChild(spanNode);
      elemHeader.appendChild(nameNode);
      elemHeader.appendChild(pathNode);

    }

  }

  updateFooter() {

    // Create a node to display current volume as percent
    const volNode = document.createElement("span");
    // Convert volume to percent by multiplying the decimal value by 100
    volNode.textContent = `Volume: ${this.volume * 100}%`;

    // Create a node to display if playmode is set to random
    const randomNode = document.createElement("span");
    randomNode.textContent = this.playmodeRandom ? "Random: On" : "Random: Off";

    // Clear the footer of previous content
    this.elemFooter.innerHTML = "";

    // Append nodes to the footer
    this.elemFooter.appendChild(volNode);
    this.elemFooter.appendChild(randomNode);

  }

}

module.exports = new SongList();