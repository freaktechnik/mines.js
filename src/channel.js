export default class Channel {
    constructor(listener) {
        this.listener = listener;
    }

    emit(event, data = {}) {
        this.listener.onMessage(event, data);
    }
}
