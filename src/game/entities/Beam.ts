import {Entity} from "./Entity";
import {SpriteManager} from "../SpriteManager";
import {PhysicsManager} from "../PhysicsManager";

export class Beam{
    private readonly _x1: number;
    private readonly _y1: number;
    private readonly _x2: number;
    private readonly _y2: number;
    private readonly _color: string;
    private callback: ()=>void;
    private index: number;
    private spriteManager: SpriteManager;

    constructor(spriteManager: SpriteManager, x1: number, y1: number,
                x2: number, y2: number, team: number, callback: ()=>void) {
        this.spriteManager = spriteManager;
        this._x1 = x1;
        this._y1 = y1;
        this._x2 = x2;
        this._y2 = y2;
        switch (team) {
            case 1: this._color = "#ff0006"; break;
            case 2: this._color = "#0031ff"; break;
            default: this._color = "#e5d100"; break;
        }
        this.callback = callback;
        this.draw();
        this.processBeam();
    }

    draw(){
        this.index = this.spriteManager.drawBeam(this.x1, this.y1, this.x2, this.y2, this.color)
    }

    processBeam(){
        if (!this.spriteManager.isLoaded){
            setTimeout(this.processBeam.bind(this), 100);
        }
        else{
            setTimeout(this.destroy.bind(this), 255);
        }
    }

    destroy(){
        this.callback && this.callback();
        this.spriteManager.removeBeam(this.index);
    }

    get x1(): number { return this._x1; }
    get y1(): number { return this._y1; }
    get x2(): number { return this._x2; }
    get y2(): number { return this._y2; }
    get color(): string { return this._color; }
}

