class CommandLog {
  constructor() {
    this.elemHistory = document.querySelector('#cmd-history');

    this.historyArr = [];
    this.index = -1;
  }

  getHistory() {
    return this.historyArr[this.index];
  }

  addHistory(cmd) {
    const { historyArr } = this;
    // Add new command to history if it is not the same as the last used
    if (historyArr[0] !== cmd) {
      this.historyArr.unshift(cmd);
    }
  }

  setIndex(index) {
    this.index = index;
  }

  incrementIndex() {
    const len = this.historyArr.length;
    if (len > 0 && this.index < len - 1) {
      this.index += 1;
    }
  }

  decrementIndex() {
    const len = this.historyArr.length;
    if (len > 0 && this.index > 0) {
      this.index -= 1;
    }
  }

  clearDOMHistory() {
    this.elemHistory.textContent = '';
  }

  createListNode(items) {
    // Create and format list of items (like ls command lists multiple things)
    let node = document.createElement('p');

    for (let item of items) {
      node.innerHTML += '> ' + item + '<br>';
    }

    return node;
  }

  updateDOM(obj) {
    const { elemHistory } = this;
    const { type, content } = obj;
    // Catalog of prefixes for different message types
    const prefix = { 'error': 'Error: ', 'input': '<br>$ ', 'progress': '> ' };

    if (typeof content === 'object') {
      // If the type is object, its a node already created and ready to display
      elemHistory.appendChild(content);
    } else if (type !== 'empty') {
      // Check that content is not empty, add prefix and append to DOM
      const node = document.createElement('p');
      node.innerHTML = prefix[type] + content;
      elemHistory.appendChild(node);
    }

    // Scroll window to the bottom for each new batch of items added
    elemHistory.scrollTop = elemHistory.scrollHeight;
  }
}

module.exports = new CommandLog();