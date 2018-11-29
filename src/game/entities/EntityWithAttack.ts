import {Entity} from "./Entity";
import {SpriteManager} from "../SpriteManager";
import {PhysicsManager} from "../PhysicsManager";
import {Beam} from './Beam'
import {SoundManager} from "../SoundManager";

export abstract class EntityWithAttack extends Entity{
    // Properties (children should override these)
    protected _range: number = 0;
    protected _attack: number = 0;
    protected _fireRate: number = Entity.updateSpeed;
    protected _gun_x = 0;
    protected _gun_y = 0;

    protected constructor(spriteManager: SpriteManager, physicsManager: PhysicsManager, soundManager: SoundManager,
                          x: number, y: number, angle: number) {
        super(spriteManager, physicsManager, soundManager, x, y, angle);
    }

    fire(x: number, y: number, callback?: () => void){
        let {gX, gY} = this.getGunRelativeCoords();
        this.soundManager.play('/assets/fire.mp3');
        new Beam(this.spriteManager, this.x + gX, this.y + gY, x,
            y, this.team, callback);
        this.delayedCallAI(this._fireRate);
    }

    getGunRelativeCoords(): {gX: number, gY: number} {
        let angle = this.angle * Math.PI / 180;
        let cX = this._w / 2;
        let cY = this._h / 2;
        let gX = Math.cos(angle) * (this._gun_x - cX) - Math.sin(angle) * (this._gun_y - cY) + cX;
        let gY = Math.sin(angle) * (this._gun_x - cX) + Math.cos(angle) * (this._gun_y - cY) + cY;
        return {gX, gY};
    }

    getEnemiesInRange(): Entity[]{
        return this.filterEnemies(this.physicsManager.entitiesInRange(this.centerX, this.centerY, this._range));
    }

    getAllEnemies(): Entity[]{
        return this.filterEnemies(this.physicsManager.entities);
    }

    private filterEnemies(entities: Entity[]){
        let res = [];
        for (let entity of entities) {
            if (entity.isDestructible && entity.team != this.team && !entity.isDestroyed){
                res.push(entity);
            }
        }
        return res;
    }

    fireAtEnemy(enemy: Entity){
        if (this.getDistanceTo(enemy.centerX, enemy.centerY)) {
            this.fire(enemy.centerX, enemy.centerY);
            enemy.takeDamage(this._attack);
        }
        this.delayedCallAI();
    }

    get range(): number { return this._range; }
    get attack(): number { return this._attack; }
}