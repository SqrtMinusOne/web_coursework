import {MapManager} from "./MapManager";

export class EventsManager {
    private mapManager: MapManager;
    constructor(canvas: HTMLCanvasElement, mapManager: MapManager){
        this.mapManager = mapManager;
        canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.body.addEventListener('keydown', this.onKeyDown.bind(this));
        document.body.addEventListener('keyup', this.onKeyUp.bind(this));
        canvas.addEventListener('wheel', this.onMouseWheel.bind(this));
    }
    private onMouseDown(event: MouseEvent){
        console.log(`MouseDown: ${event.clientX}, ${event.clientY}`)
    }
    private onMouseUp(event: MouseEvent){
        console.log(`MouseUp: ${event.clientX}, ${event.clientY}`);
    }
    private onKeyDown(event: KeyboardEvent){
        console.log("KeyDown " + event.key)
    }
    private onKeyUp(event: KeyboardEvent){
        console.log("KeyUp " + event.key)
    }
    private onMouseWheel(event: WheelEvent) {
        this.mapManager.scrollByY(event.wheelDelta/120*32*2);
    }
}