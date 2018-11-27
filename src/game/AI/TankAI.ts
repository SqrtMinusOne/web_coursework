import {Tank} from "../entities/Tank";
import {Entity} from "../entities/Entity";
import {EntityWithAttack} from "../entities/EntityWithAttack";
import {AIManager} from "./AI";

export class TankAI implements AIManager{
    private tank: Tank;
    private enemy: EntityWithAttack;

    constructor (tank){
        this.tank = tank;
        tank.initAI(this.makeDecision.bind(this));
        setInterval(this.checkAfk.bind(this), 500);
    }

    makeDecision(){ // Return false if can't proceed
        if (!this.tank.isLoaded){
            this.tank.delayedCallAI();
        }
        else if (this.tank.isDestroyed){
            this.tank.dropAction();
        }
        else if (!this.enemy || this.enemy.isDestroyed){
            this.enemy = this.findEnemy();
            this.tank.delayedCallAI();
        }
        else{
            this.attackEnemy(this.enemy);
        }
    }

    findEnemy(): EntityWithAttack{
        for (let enemy of this.tank.getAllEnemies()) {
            return <EntityWithAttack>enemy;
        }
        return null;
    }

    checkAfk(){
        if (this.tank.isAfk){
            this.makeDecision();
        }
    }

    attackEnemy(enemy: Entity){
        let angle = this.tank.getAngleTo(enemy.centerX, enemy.centerY);
        let distance = this.tank.getDistanceTo(enemy.centerX, enemy.centerY);
        if (Math.abs(angle) > 5) {
            this.tank.rotate(angle);
        }
        else if (distance > this.tank.range){
            this.tank.moveForward();
        }
        else{
            this.tank.fireAtEnemy(enemy);
        }
    }
}