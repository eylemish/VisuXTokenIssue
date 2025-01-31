class ToolManager {
    constructor() {
        this.tools = [];
    }

    addTool(tool) {
        this.tools.push(tool);
    }

    deleteTool(toolId) {
        this.tools = this.tools.filter(tool => tool.id !== toolId);
    }

    getTools() {
        return this.tools;
    }
}

export default ToolManager;