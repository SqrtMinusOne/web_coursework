import {Entity} from "./Entity";
import {SpriteManager} from "../SpriteManager";
import {PhysicsManager} from "../PhysicsManager";
import {Explosion} from "./Explosion";
import {SoundManager} from "../SoundManager";

export class Radar extends Entity{
    private id: number = 1;

    constructor(spriteManager: SpriteManager, physicsManager: PhysicsManager, soundManager: SoundManager,
                x: number, y: number, team: number) {
        super(spriteManager, physicsManager, soundManager, x, y, 0);
        this._isDestructible = true;
        this._max_hp = 150;
        this._cost = 100;
        this._hp = this._max_hp;
        this._team = team;
        this.draw();
        setTimeout(this.processRadar.bind(this), Entity.updateSpeed);
    }

    private processRadar(){
        this.id = (this.id + 1) % 8;
        if (!this.isDestroyed){
            this.draw();
            setTimeout(this.processRadar.bind(this), Entity.updateSpeed);
        }

    }

    destroy(): void {
        super.destroy();
        this.physicsManager.addEntity(new Explosion(this.spriteManager, this.physicsManager, this.soundManager, this.x, this.y));
    }

    get spriteName(): string {
        return `radar_${this.id + 1}`;
    }

}