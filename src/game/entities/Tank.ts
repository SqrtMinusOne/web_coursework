import {Entity} from "./Entity";
import {SpriteManager} from "../SpriteManager";
import {PhysicsManager} from "../PhysicsManager";
import {Explosion} from "./Explosion";

export class Tank extends Entity{
    private sprite_name: string;
    private speeds = [4, 5, 3, 2];
    private hps = [50, 35, 75, 100];

    constructor(spriteManager: SpriteManager, physicsManager: PhysicsManager, x: number, y: number, angle: number,
                type: number, team: number) {
        super(spriteManager, physicsManager, x, y, angle);
        this._isDestructible = true;
        this._isMovable = true;
        this._isRotatable = true;
        this._team = team;
        this.sprite_name = `${team === 1 ? 'red_tank_' : 'blue_tank_'}${type}`;
        this._speed = this.speeds[type - 1];
        this._max_hp = this.hps[type - 1];
        this._hp = this._max_hp - 10;
        this.draw();
    }

    get spriteName(): string {
        return this.sprite_name;
    }

    destroy() {
        super.destroy();
        this.physicsManager.addEntity(new Explosion(this.spriteManager, this.physicsManager, this.x, this.y));
    }
}