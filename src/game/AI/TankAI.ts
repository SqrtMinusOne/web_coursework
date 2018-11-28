import {Tank} from "../entities/Tank";
import {Entity} from "../entities/Entity";
import {EntityWithAttack} from "../entities/EntityWithAttack";
import {AIManager} from "./AI";
import {PhysicsManager} from "../PhysicsManager";

export class TankAI implements AIManager{
    private tank: Tank;
    private enemy: EntityWithAttack;
    private path: {dx: number, dy: number}[];
    private pathStartX: number;
    private pathStartY: number;
    private xCorrectNextC: boolean;
    private yCorrectNextC: boolean;
    private physicsManager: PhysicsManager;
    private nextC: number = null;

    constructor (tank, physicsManager: PhysicsManager){
        this.tank = tank;
        this.physicsManager = physicsManager;
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
        else if (!this.enemy || this.enemy.isDestroyed || !this.path){
            this.findEnemy();
            this.tank.delayedCallAI();
        }
        else{
            this.attackEnemy();
        }
    }

    findEnemy(){
        let distance = Number.MAX_VALUE;
        let closestEnemy = null;
        for (let enemy of this.tank.getAllEnemies()) {
            let current_distance = this.tank.getDistanceTo(enemy.centerX, enemy.centerY);
            if (current_distance < distance){
                distance = current_distance;
                closestEnemy = enemy;
            }
        }
        this.getPathToEnemy(closestEnemy);
        this.enemy = closestEnemy;
    }

    getPathToEnemy(enemy: Entity){
        if (!enemy)
            return null;
        let enemyCoords = this.physicsManager.getActualRelCoords(enemy);
        let tankCoords = this.physicsManager.getActualRelCoords(this.tank);
        this.path = this.physicsManager.algLee(tankCoords.x, tankCoords.y, enemyCoords.x, enemyCoords.y);
        this.pathStartX = tankCoords.x * 32;
        this.pathStartY = tankCoords.y * 32;
        this.xCorrectNextC = false;
        this.yCorrectNextC = false;
        console.log(this.path);
    }

    checkAfk(){
        if (this.tank.isAfk){
            this.makeDecision();
        }
    }

    attackEnemy(){
        let enemy = this.enemy;
        let angle = this.tank.getAngleTo(enemy.centerX, enemy.centerY);
        let distance = this.tank.getDistanceTo(enemy.centerX, enemy.centerY);
        if (distance > this.tank.range){
            this.goByPath();
        }
        else{
            this.tank.fireAtEnemy(enemy);
        }
    }

    goByPath(){
        let angle = 0;
        let step = this.path[0];
        if (!step)
            return null;
        if (this.rotateToAngle(step, angle)){ return true; }
        if (!this.nextC){
            this.nextC = this.getNextC(step);
        }
        if (this.checkIfNextCIsPassed(step)){
            this.nextC = this.getNextC(step);
            this.path.shift();
            this.goByPath();
            return true;
        }
        if (!this.moveToNextC(step)){
            this.path.length = 0;
            this.enemy = null;
        }
        return true;
    }

    moveToNextC(step): boolean{
        let distance: number;
        if (step.dx != 0){
            distance = Math.abs(this.nextC - this.tank.x);
        }
        else{
            distance = Math.abs(this.nextC - this.tank.y);
        }
        return this.tank.moveForward(distance);
    }

    rotateToAngle(step, angle):boolean {
        if (step.dx > 0)
            angle = 0;
        else if (step.dx < 0)
            angle = 180;
        else if (step.dy > 0)
            angle = 90;
        else if (step.dy < 0)
            angle = -90;
        if (this.tank.angle != angle) {
            let dAngle = this.tank.angle - angle;
            this.tank.rotate(dAngle);
            if (this.tank.angle % 90 == 0){
                this.nextC = this.getNextC(step);
            }
            return true;
        }
        return false;
    }

    getNextC(step): number{
        let coords = this.physicsManager.getActualRelCoords(this.tank);
        let nextC: number = 0;
        let correction: number = 0;
        if (step.dx > 0){
            nextC = coords.x + 1;
        } else if(step.dx < 0){
            nextC = coords.x - 1;
        } else if(step.dy > 0){
            nextC = coords.y + 1;
        } else if(step.dy < 0){
            nextC = coords.y - 1;
        }
        nextC *= 32; // BAD
        return nextC;
    }

    checkIfNextCIsPassed(step): boolean{
        if (!step){
            return null
        }
        if (step.dx > 0){
            return this.tank.x >= this.nextC;
        }
        else if (step.dx < 0){
            return this.tank.x <= this.nextC;
        }
        else if (step.dy > 0){
            return this.tank.y >= this.nextC;
        }
        else if (step.dy < 0){
            return this.tank.y <= this.nextC;
        }
    }
}