import React, { useState } from 'react';
import GraphManager from './components/graphs/GraphManager';
import ToolManager from './components/tools/ToolManager';
import ModalController from './components/modals/ModalController';

class UIController {
    constructor() {
        this.toolManager = null;
        this.modalController = null;
        this.graphManager = null;
    }

    initialize(toolManager, modalController, graphManager) {
        this.toolManager = toolManager;
        this.modalController = modalController;
        this.graphManager = graphManager;
    }

    toggleTool(toolName) {
        this.toolManager.toggle(toolName);
    }

    openModal(modalType, data) {
        this.modalController.open(modalType, data);
    }

    addGraph(graphData) {
        this.graphManager.addGraph(graphData);
    }
}

export default UIController;
