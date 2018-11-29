import {MapManager} from './MapManager'
import {SpriteManager} from "./SpriteManager";
import {EventsManager, MOUSE_DOWN, MOUSE_WHEEL} from "./EventsManager";
import {PhysicsManager} from "./PhysicsManager";
import {Tank} from "./entities/Tank";
import {TankAI} from './AI/TankAI'
import {Entity} from "./entities/Entity";
import {Turret} from "./entities/Turret";
import {TurretAI} from "./AI/TurretAI";
import {Radar} from "./entities/Radar";
import {EntityWithAttack} from "./entities/EntityWithAttack";
import {SoundManager} from "./SoundManager";
import {PlayerAI} from "./AI/PlayerAI";

interface Score {
    player: string,
    score: number
}

export class GameManager {
    private mapManager: MapManager;
    private spriteManager: SpriteManager;
    private eventsManager: EventsManager;
    private physicsManager: PhysicsManager;
    private soundManager: SoundManager;
    private playerAI: PlayerAI;
    private canvas: HTMLCanvasElement;
    public teamEnergies: number[] = [0, 0, 0];
    private maxTeamEnergies: number[] = [0, 0, 0];
    private teamScores: number[] = [0, 0, 0];
    private addPointsAtStep: number = 16;
    private _table_fields: HTMLElement[][];
    private _chosen_team;
    public chosen_name;
    public chosen_type;
    private game_interval: any = null;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.mapManager = new MapManager(canvas, '/assets/first.json');
        this.spriteManager = new SpriteManager(canvas, '/assets/sprites.json', this.mapManager);
        this.eventsManager = new EventsManager(canvas);
        this.soundManager = new SoundManager();
        this.soundManager.loadArray(['/assets/ost.mp3', '/assets/boom.mp3', '/assets/fire.mp3']);
        this.soundManager.play('/assets/ost.mp3');
        this.physicsManager = new PhysicsManager(this.mapManager, this.spriteManager);
        this.physicsManager.destroyCallback = this.destroyEntityCallback.bind(this);
        this.mapManager.draw();
        //  this.mapManager.startUpdate();
        this.setUpEvents();
        this.parseEntities();

    }

    setUpEvents() {
        this.eventsManager.addHandler(MOUSE_WHEEL, (event: MouseWheelEvent) => {
            this.mapManager.scrollByY(-event.wheelDelta / 120 * 32 * 2);
        });
        this.eventsManager.addHandler(MOUSE_DOWN, (event: MouseEvent) => {
            let x = event.clientX - (<DOMRect>this.canvas.getBoundingClientRect()).x + this.mapManager.view.x;
            let y = event.clientY - (<DOMRect>this.canvas.getBoundingClientRect()).y + this.mapManager.view.y;
            if (!this._chosen_team || !this.chosen_type || !this.chosen_name)
                return;
            this.createEnitity(this.chosen_name, x, y, 0, this.chosen_type, this._chosen_team, false);
            console.log(x, y);
        })
    }

    private parseEntities() {
        if (!this.mapManager.isLoaded) {
            setTimeout(this.parseEntities.bind(this), 100);
            return;
        }
        let layer = this.mapManager.getObjectLayer();
        for (let object of layer.objects) {
            let name;
            let team;
            switch (object.name) {
                case 'blue_radar':
                    name = 'radar';
                    team = 2;
                    break;
                case 'red_radar':
                    name = 'radar';
                    team = 1;
            }
            if (name)
                this.createEnitity(name, object.x, object.y - 32, 0, 0, team);
        }
    }

    createEnitity(name: string, x: number, y: number, angle: number = 0,
                          type?: number, team: number = this._chosen_team, ignore_conditions: boolean = true): Entity {
        function checkConditions() {
            if (!ignore_conditions) {
                let map = this.getControlledAreas();
                let cx = Math.floor(x / this.mapManager.tSize.x);
                let cy = Math.floor(y / this.mapManager.tSize.y);
                if (map[cx][cy] != team) {
                    return false;
                }
            }
            let cost: number = 0;
            switch (name) {
                case 'tank': cost = 30; break;
                case 'turret': cost = 75; break;
                default: cost = 100; break;
            }
            if (this.teamEnergies[team] >= cost){
                this.teamEnergies[team] -= cost;
                return true;
            }
            return false;
        }
        if (!ignore_conditions && !checkConditions.call(this)){
            return;
        }
        let entity: Entity;
        switch (name) {
            case 'tank':
                entity = new Tank(this.spriteManager, this.physicsManager, this.soundManager, x, y, angle, type, team);
                new TankAI(entity, this.physicsManager);
                break;
            case 'turret':
                entity = new Turret(this.spriteManager, this.physicsManager, this.soundManager, x, y, angle, team);
                new TurretAI(entity);
                break;
            case 'radar':
                entity = new Radar(this.spriteManager, this.physicsManager, this.soundManager, x, y, team);
                break;
        }
        this.physicsManager.addEntity(entity);
        return entity;
    }

    private destroyEntityCallback(entity: Entity){
        if (entity.team > 0){
            let destructor_team = entity.team == 2 ? 1 : 2;
            if (!entity.isMovable && !entity.isRotatable){
                this.teamScores[destructor_team] += 100;
            }
            else if (!entity.isMovable && entity.isRotatable){
                this.teamScores[destructor_team] += 50;
            }
            else{
                this.teamScores[destructor_team] += 35;
            }
        }
    }

    private getGameStatus(){
        if (!this.spriteManager.isLoaded)
            return;
        this.getControlledAreas();
        this.teamEnergies[1] = Math.min(this.teamEnergies[1] + this.addPointsAtStep,
            this.maxTeamEnergies[1]);
        this.teamEnergies[2] = Math.min(this.teamEnergies[2] + this.addPointsAtStep,
            this.maxTeamEnergies[2]);
        this.updateScores();
      //  return map;
    }

    getControlledAreas() {
        let map = this.physicsManager.copyPassableMap();
        this.maxTeamEnergies = [0, 0, 0];
        for (let entity of this.physicsManager.entities) {
            if (entity.team > 0) {
                let range = (<EntityWithAttack>entity).range;
                if (!range) {
                    range = 5;
                    this.maxTeamEnergies[entity.team] += 25
                }
                else
                    range = Math.floor(range / this.mapManager.tSize.x);
                let coords = this.physicsManager.getActualRelCoords(entity);
                let x = coords.x;
                let y = coords.y;
                let x1 = x - range < 0 ? 0 : x - range;
                let y1 = y - range < 0 ? 0 : y - range;
                let x2 = x + range >= this.mapManager.xCount ? this.mapManager.xCount - 1 : x + range;
                let y2 = y + range >= this.mapManager.yCount ? this.mapManager.yCount - 1 : y + range;
                for (let x = x1; x < x2; x++) {
                    for (let y = y1; y < y2; y++) {
                        map[x][y] = entity.team;
                    }
                }
            }
        }
        return map;
    }

    private updateScores() {
        for (let team = 1; team <= 2; team++) {
            this._table_fields[0][team].innerText = this.teamScores[team].toString();
            this._table_fields[1][team].innerText = this.teamEnergies[team].toString();
            this._table_fields[2][team].innerText = this.maxTeamEnergies[team].toString();
        }
        this.checkGameOver();
    }

    private checkGameOver(){
        /*for (let team = 1; team <= 2; team++){
            if (this.maxTeamEnergies[team] == 0){
                let winner = team == 2 ? 1 : 2;
                let currentScore = this.teamScores[winner];
                let scoreStr = localStorage.getItem('FedVsRebScore');
                let scores = [];
                if (scoreStr){
                    scores = JSON.parse(scoreStr);
                }
                for(let score of scores){
                    if (score.score < currentScore)
                        break;
                }

                localStorage.setItem('FedVsRebScore', JSON.stringify(scores));
            }
        }*/
    }

    set table_fields(value: HTMLElement[][]) { this._table_fields = value; }

    set chosen_team(value) {
        this._chosen_team = value;
        this.game_interval = setInterval(()=>{this.getGameStatus()}, 1000);
        let teamAI = this._chosen_team == 1 ? 2 : 1;
        this.playerAI = new PlayerAI(teamAI, this, this.physicsManager);
    }

    get isLoaded(): boolean{
        return this.mapManager.isLoaded && this.spriteManager.isLoaded;
    }

}