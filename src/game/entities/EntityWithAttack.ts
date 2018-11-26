import {Entity} from "./Entity";
import {SpriteManager} from "../SpriteManager";
import {PhysicsManager} from "../PhysicsManager";
import {Beam} from './Beam'

export abstract class EntityWithAttack extends Entity{
    // Properties (children should override these)
    protected _range: number = 0;
    protected _attack: number = 0;
    protected _gun_x = 0;
    protected _gun_y = 0;

    protected constructor(spriteManager: SpriteManager, physicsManager: PhysicsManager, x: number, y: number, angle: number) {
        super(spriteManager, physicsManager, x, y, angle);
    }

    fire(dx: number, dy: number, callback?: ()=>void){
        let angle = this.angle * Math.PI / 180;
        let cX = this._w / 2;
        let cY = this._h / 2;
        let gX = Math.cos(angle)*(this._gun_x - cX) - Math.sin(angle)*(this._gun_y - cY) + cX;
        let gY = Math.sin(angle)*(this._gun_x - cX) + Math.cos(angle)*(this._gun_y - cY) + cY;
        new Beam(this.spriteManager, this.x + gX, this.y + gY, this.x + 60,
            this.y + 60, this.team, callback);
    }

    get range(): number { return this._range; }
    get attack(): number { return this._attack; }
}