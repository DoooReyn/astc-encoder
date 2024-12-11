type HandleCallback = (item: string, result: boolean) => void;

class Collector {
    private _list: Set<string>;
    private _taskCompletedHandler: HandleCallback | null = null;
    private _finishedHandler: Function | null = null;

    constructor() {
        this._list = new Set();
    }

    public add(item: string) {
        this._list.add(item);
    }

    public addMultiple(items: string[]) {
        items.forEach((item) => this.add(item));
    }

    public addAll(items: string[]) {
        this._list = new Set(items);
    }

    public has(item: string) {
        return this._list.has(item);
    }

    public remove(item: string, result: boolean = true) {
        this._list.delete(item);
        this.invokeTaskCompleted(item, result);
        if (this._list.size === 0) {
            this.invokeFinished();
        }
    }

    public get size() {
        return this._list.size;
    }

    public onTaskCompleted(callback: HandleCallback) {
        if (this._taskCompletedHandler) this._taskCompletedHandler = null;
        this._taskCompletedHandler = callback;
    }

    public onFinished(callback: HandleCallback) {
        if (this._finishedHandler) this._finishedHandler = null;
        this._finishedHandler = callback;
    }

    private invokeTaskCompleted(item: string, result: boolean) {
        if (this._taskCompletedHandler) {
            this._taskCompletedHandler.call(this, item, result);
        }
    }

    private invokeFinished() {
        if (this._finishedHandler) {
            this._finishedHandler.call(this);
            this._finishedHandler = null;
            this._taskCompletedHandler = null;
        }
    }
}

const collector = new Collector();
export default collector;
