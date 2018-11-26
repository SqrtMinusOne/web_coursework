import {SpriteManager} from "../SpriteManager";
import {PhysicsManager} from "../PhysicsManager";

export abstract class Entity{
    // Geometry
    private _x: number;
    private _y: number;
    protected _w: number = 0;
    protected _h: number = 0;
    private _angle: number;
    // Properties (for children to override)
    // TODO Maybe mixins?
    protected _isDestructible: boolean = false;
    protected _isRotatable: boolean = false;
    protected _isMovable: boolean = false;
    protected _speed: number = 0;
    protected _max_hp: number = -2;
    protected _hp: number = -2;
    // Drawing parameters
    private _index: number = -1;
    protected spriteManager: SpriteManager;
    private _isLoaded: boolean = false;
    // Game stuff
    protected _team: number = -1;
    protected physicsManager: PhysicsManager;
    // AI stuff
    protected _action: any;
    static updateSpeed: number = 75;

    protected constructor(spriteManager: SpriteManager, physicsManager: PhysicsManager, x: number, y: number, angle: number){
        this._x = x;
        this._y = y;
        this._angle = angle;
        this.spriteManager = spriteManager;
        this.physicsManager = physicsManager;
    }

    draw(){
        let cur_hp = this.max_hp > 0 ? this.hp / this.max_hp * 100 : -1;
        this._index = this.spriteManager.drawSpite(this.spriteName, this.x, this.y, this.angle,
            this._index, true, cur_hp);
        if (this.w === 0 || this.h === 0){
            this.getGeometry();
        }
    }

    private getGeometry() { //Must be called in child constructor through draw or directly
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
        if (!this.spriteManager.isLoaded) {
            setTimeout(()=>{this.move(dx, dy)}, 100);
        }
        if (this.physicsManager.isPassable(this.x + dx, this.y + dy, this)){
            this._x += dx;
            this._y += dy;
            this.draw();
        }
    }

    moveForward(){
        let dx = Math.round(this.speed * Math.sin(this.angle * Math.PI / 180));
        let dy = -Math.round(this.speed * Math.cos(this.angle * Math.PI / 180));
        this.move(dx, dy);
    }

    rotate(dAngle: number){
        if (this.isRotatable){
            this._angle += dAngle;
            this.draw();
        }
    }

    takeDamage(damage: number){
        if (this.isDestructible){
            this._hp -= damage;
            if (this._hp < 0){
                this.destroy();
            }
        }
    }

    destroy(){
        this.physicsManager.removeEntity(this);
        this.spriteManager.removeSprite(this.index);
    }

    abstract get spriteName(): string;

    getDistanceTo(x: number, y: number): number{
        return Math.sqrt((x - this.centerX)**2 + (y - this.centerY)**2);
    }

    getAngleTo(x: number, y: number): number{
        let dX = x - this.centerX;
        let dY = y - this.centerY;
        let relAngle=Math.atan(dY / dX) / Math.PI * 180;
        return this._angle + Math.round(relAngle);
    }

    protected dropAction(){
        clearTimeout(this._action);
    }

    get index(): number { return this._index; }
    get y(): number { return this._y; }
    get x(): number { return this._x; }
    get h(): number { return this._h; }
    get w(): number { return this._w; }
    get centerX(): number { return this._x + this.w / 2 }
    get centerY(): number { return this._y + this.h / 2 }
    get angle(): number { return this._angle; }
    get isDestructible(): boolean { return this._isDestructible; }
    get isRotatable(): boolean { return this._isRotatable; }
    get isMovable(): boolean { return this._isMovable; }
    get team(): number { return this._team; }
    get isLoaded(): boolean { return this._isLoaded; }
    get speed(): number { return this._speed; }
    get hp(): number { return this._hp; }
    get max_hp(): number { return this._max_hp; }
}