class Tool {
  constructor(name) {
    this.name = name;
    this.isActive = false;
  }

  activate() {
    this.isActive = true;
    console.log(`${this.name} tool activated.`);
  }

  deactivate() {
    this.isActive = false;
    console.log(`${this.name} tool deactivated.`);
  }

  executeAction(action, params) {
    if (typeof this[action] === 'function') {
      this[action](params);
    } else {
      console.error(`Action ${action} not found in tool ${this.name}.`);
    }
  }
}

export default Tool;
