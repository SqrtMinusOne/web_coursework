import {SpriteManager} from "../SpriteManager";
import {PhysicsManager} from "../PhysicsManager";

export abstract class Entity{
    // Geometry
    private _x: number;
    private _y: number;
    private _w: number = 0;
    private _h: number = 0;
    private _angle: number;
    // Properties
    protected _isDestructible: boolean = false;
    protected _isRotatable: boolean = false;
    protected _isMovable: boolean = false;
    // Drawing parameters
    private _index: number = -1;
    private spriteManager: SpriteManager;
    private _isLoaded: boolean = false;
    // Game stuff
    protected _team: number = -1;
    protected physicsManager: PhysicsManager;

    protected constructor(spriteManager: SpriteManager, physicsManager: PhysicsManager, x: number, y: number, angle: number){
        this._x = x;
        this._y = y;
        this._angle = angle;
        this.spriteManager = spriteManager;
        this.physicsManager = physicsManager;
    }

    draw(){ //Must be called in child constructor
        this._index = this.spriteManager.drawSpite(this.spriteName, this.x, this.y, this.angle, this._index);
        if (this.w === 0 || this.h === 0){
            this.getGeometry();
        }
    }

    private getGeometry() {
        if (!this.spriteManager.isLoaded){
            setTimeout(()=>{this.getGeometry()}, 100);
        }
        else{
            let sprite = this.spriteManager.getSpriteByIndex(this._index);
            this._w = sprite.w;
            this._h = sprite.h;
            this._isLoaded = true;
        }
    }

    move(dx: number, dy: number){
        if (this.physicsManager.isPassable(this.x + dx, this.y + dy, this)){
            this._x += dx;
            this._y += dy;
            this.draw();
        }
    }

    abstract get spriteName(): string;
    get index(): number { return this._index; }
    get y(): number { return this._y; }
    get x(): number { return this._x; }
    get h(): number { return this._h; }
    get w(): number { return this._w; }
    get angle(): number { return this._angle; }
    get isDestructible(): boolean { return this._isDestructible; }
    get isRotatable(): boolean { return this._isRotatable; }
    get isMovable(): boolean { return this._isMovable; }
    get team(): number { return this._team; }
    get isLoaded(): boolean { return this._isLoaded; }
}