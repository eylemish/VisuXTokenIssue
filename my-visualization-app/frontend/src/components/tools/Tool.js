class Tool {
    constructor(id, name = "Unnamed Tool") {  // Default name is "Unnamed Tool"
        this.id = id;       // Unique id
        this.name = name;   // Name if the tool
    }

    getDescription() {
        return `Tool: ${this.name}`;
    }
}

export default Tool;