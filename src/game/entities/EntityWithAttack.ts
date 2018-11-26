import {Entity} from "./Entity";
import {SpriteManager} from "../SpriteManager";
import {PhysicsManager} from "../PhysicsManager";

export abstract class EntityWithAttack extends Entity{
    // Properties (children should override these)
    protected _range: number = 0;
    protected _attack: number = 0;

    protected constructor(spriteManager: SpriteManager, physicsManager: PhysicsManager, x: number, y: number, angle: number) {
        super(spriteManager, physicsManager, x, y, angle);
    }

    fire(dx: number, dy: number){

    }

    get range(): number { return this._range; }
    get attack(): number { return this._attack; }
}