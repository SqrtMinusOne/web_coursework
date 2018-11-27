export const MOUSE_WHEEL = 'mouseWheel';
export const MOUSE_DOWN = 'mouseDown';
export const MOUSE_UP = 'mouseUp';
export const KEY_DOWN = 'keyDown';
export const KEY_UP = 'keyUp';

export class EventsManager {
    private handlers: {[event_name: string] : ((event)=>void)[]};

    constructor(canvas: HTMLCanvasElement){
        canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        canvas.addEventListener('contextmenu', (event)=>{
            event.preventDefault();
            event.stopPropagation();
        });
        canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.body.addEventListener('keydown', this.onKeyDown.bind(this));
        document.body.addEventListener('keyup', this.onKeyUp.bind(this));
        canvas.addEventListener('wheel', this.onMouseWheel.bind(this));
        this.handlers = {}
    }

    private callHandler(event_name:string, event){
        if (!(event_name in this.handlers))
            return;
        for (let handler of this.handlers[event_name]) {
            if (handler){
                handler(event);
            }
        }
        event.preventDefault();
    }

    addHandler(event_name: string, handler: (event)=>void){
        let i: number;
        if (!(event_name in this.handlers)){
            this.handlers[event_name] = [];
        }
        for (i = 0; i < this.handlers[event_name].length; i++) {
            if (!this.handlers[event_name][i])
                break;
        }
        this.handlers[event_name][i] = handler;
    }

    private onMouseDown(event: MouseEvent){
        this.callHandler(MOUSE_DOWN, event);
    }
    private onMouseUp(event: MouseEvent){
        this.callHandler(MOUSE_UP, event);
    }
    private onKeyDown(event: KeyboardEvent){
        this.callHandler(KEY_DOWN, event);
    }
    private onKeyUp(event: KeyboardEvent){
        this.callHandler(KEY_UP, event);
    }
    private onMouseWheel(event: WheelEvent) {
        this.callHandler(MOUSE_WHEEL, event);
    }
}