import {AIManager} from "./AI";
import {Turret} from "../entities/Turret";
import {EntityWithAttack} from "../entities/EntityWithAttack";

export class TurretAI implements AIManager{
    private turret: Turret;
    private enemy: EntityWithAttack;

    constructor(turret){
        this.turret = turret;
        turret.initAI(this.makeDecision.bind(this));
    }

    makeDecision(){
        if (!this.turret.isLoaded){
            this.turret.delayedCallAI();
        }
        else if (this.turret.isDestroyed){
            this.turret.dropAction();
        }
        else if (!this.enemy || this.enemy.isDestroyed){
            this.turret.stopFire();
            this.enemy = this.findEnemy();
            this.turret.delayedCallAI();
        }
        else{
            this.attackEnemy(this.enemy);
        }
    }

    private attackEnemy(enemy: EntityWithAttack) {
        let angle = this.turret.getAngleTo(enemy.centerX, enemy.centerY);
        let distance = this.turret.getDistanceTo(enemy.centerX, enemy.centerY);
        if (Math.abs(angle) > 5){
            this.turret.rotate(angle);
        }
        else if (distance > this.turret.range){
            this.enemy = null;
            this.turret.delayedCallAI();
        }
        else{
            this.turret.fireAtEnemy(enemy);
        }
    }

    private findEnemy() {
        for (let enemy of this.turret.getEnemiesInRange()){
            return <EntityWithAttack>enemy;
        }
        return null;
    }
}