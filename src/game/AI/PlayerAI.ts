import {AIManager} from "./AI";
import {GameManager} from "../GameManager";
import {PhysicsManager} from "../PhysicsManager";

export class PlayerAI implements AIManager{
    private _team: number;
    private _gameManager: GameManager;
    private _physicsManager : PhysicsManager;
    private _timeout: any;
    static AISpeed: number = 2000;
    constructor(team: number, gameManager: GameManager, physicsManager: PhysicsManager){
        this._team = team;
        this._gameManager = gameManager;
        this._physicsManager = physicsManager;
        this.initAI();
    }

    private initAI(){
        if (!this._gameManager.isLoaded){
            this._timeout = setTimeout(()=>{this.initAI()}, 100);
        }
        else{
            this.makeDecision();
        }
    }

    makeDecision (){
        let probability = 0;
        if (this.energy < 30)
            probability = 0;
        else if (this.energy < 75){
            probability = 6;
        }
        else if (this.energy < 100){
            probability = 30;
        }
        else {
            probability = 100;
        }
        let rand = Math.floor(Math.random() * 100);
        if (rand < probability){
            this.createRandomEntity();
        }
        this._timeout = setTimeout(()=>{this.makeDecision()}, PlayerAI.AISpeed);
    }

    private createRandomEntity() {
        let map = this._gameManager.getControlledAreas();
        map = this._physicsManager.getFullPassableMap(map);
        let points = 0;
        for (let x = 0; x < map.length; x++) {
            for (let y = 0; y < map[0].length; y++){
                if (map[x][y] == this._team)
                    points++;
            }

        }
        if (points > 0){
            let chosen = Math.floor(Math.random() * points);
            let i = 0;
            for (let x = 0; x < map.length; x++) {
                for (let y = 0; y < map[0].length; y++){
                    if (map[x][y] == this._team){
                        i++;
                        if (chosen === i) {
                            this.createRandomEntityAtXY(x, y);
                        }
                    }
                }

            }
        }
    }

    private createRandomEntityAtXY(x: number, y: number) {
        console.log(x, y);
        x *= 32; // TODO BAD
        y *= 32; // Refactor this if possible
        let entName: string;
        let entType: number = 1;
        if (30 <= this.energy && this.energy < 75 ){
            entName = 'tank';
        }
        else if (this.energy < 100){
            entName = Math.random() > 0.5 ? 'tank' : 'turret';
        }
        else {
            let rand = Math.random();
            if (rand < 0.333)
                entName = 'tank';
            else if (rand < 0.666)
                entName = 'turret';
            else
                entName = 'radar';
        }
        if (entName == 'tank'){
            entType = Math.floor(Math.random() * 4) + 1;
        }
        this._gameManager.createEnitity(entName, x, y, 0, entType, this._team, false);
    }

    stopAI(){
        clearTimeout(this._timeout);
    }

    get energy(){
        return this._gameManager.teamEnergies[this._team];
    }


}