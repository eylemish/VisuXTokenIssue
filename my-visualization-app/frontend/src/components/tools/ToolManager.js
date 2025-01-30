class toolManager {
    constructor() {
        this.tools = [];
    }

    addTool(toolData) {
        const newTool = { id: Date.now(), ...toolData }; // Unique ID assigned via Date.now()
        this.tools.push(newTool);
    }

    deleteTool(toolId) {
        this.tools = this.tools.filter(tool => tool.id !== toolId);
    }

    getTools() {
        return this.tools;
    }
}

export default ToolManager;