import Tool from "./Tool";

class ToolManager {
    constructor() {
        this.tools = [
            new Tool('createGraph', 'Create Graph1'),
            new Tool('addDataset', 'Add Dataset'),
            new Tool('dataInterpolate', 'Interpolate'),
            new Tool('dataExtrapolate', 'Extrapolate'),
        ];
    }

    addTool(tool) {
        this.tools.push(tool);
    }

    getTools() {
        return this.tools;
    }
}

export default ToolManager;