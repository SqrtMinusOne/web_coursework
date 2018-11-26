import {MapManager} from './MapManager'
import {SpriteManager} from "./SpriteManager";
import {EventsManager, MOUSE_DOWN, MOUSE_WHEEL} from "./EventsManager";
import {PhysicsManager} from "./PhysicsManager";
import {Tank} from "./entities/Tank";
import {EntityWithAttack} from "./entities/EntityWithAttack";
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
        // this.physicsManager.addEntity(new Explosion(this.spriteManager, this.physicsManager, 64,256));
/*        setInterval(()=>{
            if(this.physicsManager.entities[0]) {
                let tank: EntityWithAttack = <EntityWithAttack>this.physicsManager.entities[0];
                tank.rotate(5);
                tank.moveForward();
                // this.physicsManager.entities[0].takeDamage(1);
            }
        }, 100);
        setInterval(()=>{
            if(this.physicsManager.entities[0]) {
                let tank: EntityWithAttack = <EntityWithAttack>this.physicsManager.entities[0];
                tank.fire(64, 64)
                // this.physicsManager.entities[0].takeDamage(1);
            }
        }, 1000);*/
        let tank1 = this.createEnitity('tank', 0, 320, 0, 1, 2);
        let tank2 =  this.createEnitity('tank', 290, 320, 0, 2, 2 );
        this.setUpEvents();
    }

    setUpEvents(){
        this.eventsManager.addHandler(MOUSE_WHEEL, (event: MouseWheelEvent)=>{
            this.mapManager.scrollByY(-event.wheelDelta/120*32*2);
        });
        this.eventsManager.addHandler(MOUSE_DOWN, (event: MouseEvent)=>{

        })
    }

    createEnitity(name: string, x: number, y: number, angle: number = 0, team?: number, type?: number): Entity{
        let entity: Entity;
        switch(name){
            case 'tank': entity = new Tank(this.spriteManager, this.physicsManager, x, y, angle, team, type); break;
        }
        return entity;
    }
}