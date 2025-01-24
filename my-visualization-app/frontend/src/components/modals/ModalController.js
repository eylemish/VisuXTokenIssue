class ModalController {
    constructor() {
        this.currentModal = null;
    }

    open(modalType, data) {
        this.currentModal = { type: modalType, data: data };
    }

    close() {
        this.currentModal = null;
    }

    getCurrentModal() {
        return this.currentModal;
    }
}

export default ModalController;
