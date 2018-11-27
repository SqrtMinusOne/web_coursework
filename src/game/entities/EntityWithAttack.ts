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

    fire(x: number, y: number, callback?: () => void){
        let {gX, gY} = this.getGunRelativeCoords();
        new Beam(this.spriteManager, this.x + gX, this.y + gY, x,
            y, this.team, callback);
    }

    getGunRelativeCoords(): {gX: number, gY: number} {
        let angle = this.angle * Math.PI / 180;
        let cX = this._w / 2;
        let cY = this._h / 2;
        let gX = Math.cos(angle) * (this._gun_x - cX) - Math.sin(angle) * (this._gun_y - cY) + cX;
        let gY = Math.sin(angle) * (this._gun_x - cX) + Math.cos(angle) * (this._gun_y - cY) + cY;
        return {gX, gY};
    }

    getEnemies(): Entity[]{
        let cX = this._w / 2;
        let cY = this._h / 2;
        let all = this.physicsManager.entitiesInRange(cX, cY, this._range);
        let res: Entity[] = [];
        for (let entity of all) {
            if (entity.isDestructible && entity.team != this.team){
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
    }

    attackEnemy(enemy: Entity): boolean{
        if (!enemy.isLoaded){
            this._action = setTimeout(()=>{this.attackEnemy(enemy)}, 100);
            return true;
        }
        if (!enemy){
            return false;
        }
        let angle = this.getAngleTo(enemy.centerX, enemy.centerY);
        let distance = this.getDistanceTo(enemy.centerX, enemy.centerY);
        if (Math.abs(angle) > 15){
            let angleToRotate = angle > 0 ? 15 : -15;
            this.rotate(angleToRotate);
            this._action = setTimeout(()=>{this.attackEnemy(enemy)}, Entity.updateSpeed);
            return true;
        }
        if (distance <= this.range){
            this.fireAtEnemy(enemy);
            if (!enemy.isDestroyed) {
                this._action = setTimeout(() => { this.attackEnemy(enemy) }, Entity.updateSpeed * 10);
                return true;
            }
            else return false;
        }
        else{
            this.rotate(angle);
            this.moveForward();
            this._action = setTimeout(()=>{this.attackEnemy(enemy)}, Entity.updateSpeed);
            return true;
        }
    }

    get range(): number { return this._range; }
    get attack(): number { return this._attack; }
}