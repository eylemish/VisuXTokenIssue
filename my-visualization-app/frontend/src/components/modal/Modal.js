class Modal {
  constructor(id, title, content, options = {}) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.options = options; // Optional settings like size, closable, etc.
    this.isOpen = false;
  }

  open() {
    this.isOpen = true;
    console.log(`Modal '${this.title}' is now open.`);
  }

  close() {
    this.isOpen = false;
    console.log(`Modal '${this.title}' is now closed.`);
  }

  updateContent(newContent) {
    this.content = newContent;
    console.log(`Modal '${this.title}' content updated.`);
  }

  setOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    console.log(`Modal '${this.title}' options updated.`);
  }

  getInfo() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      options: this.options,
      isOpen: this.isOpen,
    };
  }
}

export default Modal;
