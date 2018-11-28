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

export class GameManager{
    private mapManager: MapManager;
    private spriteManager: SpriteManager;
    private eventsManager: EventsManager;
    private physicsManager: PhysicsManager;
    private canvas: HTMLCanvasElement;
    public chosen_team;
    public chosen_name;
    public chosen_type;

    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas;
        this.mapManager = new MapManager(canvas, '/assets/first.json');
        this.spriteManager = new SpriteManager(canvas, '/assets/sprites.json', this.mapManager);
        this.eventsManager = new EventsManager(canvas);
        this.physicsManager = new PhysicsManager(this.mapManager, this.spriteManager);
        this.mapManager.draw();
      //  this.mapManager.startUpdate();
        this.setUpEvents();
        this.parseEntities();
    }

    setUpEvents(){
        this.eventsManager.addHandler(MOUSE_WHEEL, (event: MouseWheelEvent)=>{
            this.mapManager.scrollByY(-event.wheelDelta/120*32*2);
        });
        this.eventsManager.addHandler(MOUSE_DOWN, (event: MouseEvent)=>{
            let x = event.clientX - (<DOMRect>this.canvas.getBoundingClientRect()).x + this.mapManager.view.x;
            let y = event.clientY - (<DOMRect>this.canvas.getBoundingClientRect()).y + this.mapManager.view.y;
            if (!this.chosen_team || !this.chosen_type || !this.chosen_name)
                return;
            this.createEnitity(this.chosen_name, x, y, 0, this.chosen_type, this.chosen_team);
            console.log(x, y);
        })
    }

    private parseEntities(){
        if (!this.mapManager.isLoaded){
            setTimeout(this.parseEntities.bind(this), 100);
            return;
        }
        let layer = this.mapManager.getObjectLayer();
        for (let object of layer.objects) {
            let name; let team;
            switch (object.name) {
                case 'blue_radar': name = 'radar'; team = 2; break;
                case 'red_radar': name = 'radar'; team = 1;
            }
            if (name)
                this.createEnitity(name, object.x, object.y - 32, 0, 0, team);
        }
    }

    private createEnitity(name: string, x: number, y: number, angle: number = 0,
                          type?: number, team: number = this.chosen_team): Entity{
        let entity: Entity;
        switch(name){
            case 'tank':
                entity = new Tank(this.spriteManager, this.physicsManager, x, y, angle, type, team);
                new TankAI(entity, this.physicsManager);
                break;
            case 'turret':
                entity = new Turret(this.spriteManager, this.physicsManager, x, y, angle, team);
                new TurretAI(entity);
                break;
            case 'radar':
                entity = new Radar(this.spriteManager, this.physicsManager, x, y, team);
                break;
        }
        this.physicsManager.addEntity(entity);
        return entity;
    }

}