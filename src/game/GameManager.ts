import {MapManager} from './MapManager'
import {SpriteManager} from "./SpriteManager";
import {EventsManager, MOUSE_DOWN, MOUSE_WHEEL} from "./EventsManager";
import {PhysicsManager} from "./PhysicsManager";
import {Tank} from "./entities/Tank";
import {TankAI} from './AI/TankAI'
import {Entity} from "./entities/Entity";

export class GameManager{
    private mapManager: MapManager;
    private spriteManager: SpriteManager;
    private eventsManager: EventsManager;
    private physicsManager: PhysicsManager;

    constructor(canvas: HTMLCanvasElement){
        this.mapManager = new MapManager(canvas, '/assets/first.json');
        this.spriteManager = new SpriteManager(canvas, '/assets/sprites.json', this.mapManager);
        this.eventsManager = new EventsManager(canvas);
        this.physicsManager = new PhysicsManager(this.mapManager);
        this.mapManager.draw();
      //  this.mapManager.startUpdate();
        this.setUpEvents();
    }

    setUpEvents(){
        this.eventsManager.addHandler(MOUSE_WHEEL, (event: MouseWheelEvent)=>{
            this.mapManager.scrollByY(-event.wheelDelta/120*32*2);
        });
        this.eventsManager.addHandler(MOUSE_DOWN, (event: MouseEvent)=>{
            let team;
            if (event.button === 0)
                team = 1;
            else
                team = 2;
            this.createEnitity('tank', event.clientX + this.mapManager.view.x,
                event.clientY + this.mapManager.view.y, 0, team, 2);
        })
    }

    createEnitity(name: string, x: number, y: number, angle: number = 0, team?: number, type?: number): Entity{
        let entity: Entity;
        switch(name){
            case 'tank':
                entity = new Tank(this.spriteManager, this.physicsManager, x, y, angle, type, team);
                new TankAI(entity);
            break;
        }
        this.physicsManager.addEntity(entity);
        return entity;
    }
}