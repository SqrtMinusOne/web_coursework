import {Entity} from "./Entity";
import {SpriteManager} from "../SpriteManager";
import {PhysicsManager} from "../PhysicsManager";
import {Explosion} from "./Explosion";
import {EntityWithAttack} from "./EntityWithAttack";

export class Tank extends EntityWithAttack{
    private sprite_name: string;
    private speeds = [4, 5, 3, 2];
    private hps = [50, 35, 75, 100];
    private ranges = [96, 160, 100, 64];
    private attacks = [3, 4, 2, 6];
    private fired: boolean = false;

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
        this._range = this.ranges[type - 1];
        this._attack = this.attacks[type - 1];
        this._max_rotate_angle = 15;
        this._fireRate = Entity.updateSpeed * 3;
        this._hp = this._max_hp;
        this._gun_x = 3;
        this._gun_y = 16;
        this.draw();
    }

    get spriteName(): string {
        return this.fired ? this.sprite_name + '_fire' : this.sprite_name;
    }

    fire(x: number, y: number): void {
        super.fire(x, y, () => {
            this.fired = false
        });
        this.fired = true;
    }

    destroy() {
        super.destroy();
        this.physicsManager.addEntity(new Explosion(this.spriteManager, this.physicsManager, this.x, this.y));
    }
}