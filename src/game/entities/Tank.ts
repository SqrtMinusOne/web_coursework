import {Entity} from "./Entity";
import {SpriteManager} from "../SpriteManager";
import {PhysicsManager} from "../PhysicsManager";

export class Tank extends Entity{
    private sprite_name: string;

    constructor(spriteManager: SpriteManager, physicsManager: PhysicsManager, x: number, y: number, angle: number, type: number, team: number) {
        super(spriteManager, physicsManager, x, y, angle);
        this._isDestructible = true;
        this._isMovable = true;
        this._isRotatable = true;
        this._team = team;
        this.sprite_name = `${team === 1 ? 'red_tank_' : 'blue_tank_'}${type}`;
        this.draw();
    }

    get spriteName(): string {
        return this.sprite_name;
    }

}