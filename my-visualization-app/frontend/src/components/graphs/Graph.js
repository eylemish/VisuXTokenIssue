class Graph {
    constructor(title, data, type) {
        this.title = title; 
        this.data = data;    // Graph Data
        this.type = type;    
        this.id = Date.now(); // Unique graph id
    }

    // Non finished Graph Methods
    updateTitle(newTitle) {
        this.title = newTitle;
    }

    updateData(newData) {
        this.data = newData;
    }
}

export default Graph;
