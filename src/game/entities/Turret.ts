import {EntityWithAttack} from "./EntityWithAttack";
import {SpriteManager} from "../SpriteManager";
import {PhysicsManager} from "../PhysicsManager";
import {Explosion} from "./Explosion";
import {Entity} from "./Entity";

export class Turret extends EntityWithAttack{
    private _ind: number;

    constructor(spriteManager: SpriteManager, physicsManager: PhysicsManager, x: number, y: number, angle: number,
                team: number) {
        super(spriteManager, physicsManager, x, y, angle);
        this._isDestructible = true;
        this._isRotatable = true;
        this._max_rotate_angle = 20;
        this._max_hp = 100;
        this._range = 200;
        this._attack = 5;
        this._fireRate = Entity.updateSpeed * 3;
        this._hp = this._max_hp;
        this._ind = 2;
        this._team = team;
        this._gun_x = 3;
        this._gun_y = 16;
        this.draw();
    }

    fire(x: number, y: number): void {
        super.fire(x, y, ()=>{
            this._ind = (this._ind + 1) % 17 + 1;
        });
    }

    stopFire(){
        this._ind = 2;
    }

    destroy(): void {
        super.destroy();
        this.physicsManager.addEntity(new Explosion(this.spriteManager, this.physicsManager, this.x, this.y));
    }

    get spriteName(): string {
        return `turret_${this._ind}`;
    }
}