import {MapManager} from './MapManager'
import {SpriteManager} from "./SpriteManager";
import {EventsManager, MOUSE_DOWN, MOUSE_WHEEL} from "./EventsManager";
import {PhysicsManager} from "./PhysicsManager";
import {Tank} from "./entities/Tank";
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
        this.physicsManager.addEntity(new Tank(this.spriteManager, this.physicsManager, 0,
            0, 90, 2, 1));
        setInterval(()=>{
            this.physicsManager.entities[0].move(5, 0);
        }, 100);
        this.setUpEvents();
    }

    setUpEvents(){
        this.eventsManager.addHandler(MOUSE_WHEEL, (event: MouseWheelEvent)=>{
            this.mapManager.scrollByY(-event.wheelDelta/120*32*2);
        });
        this.eventsManager.addHandler(MOUSE_DOWN, (event: MouseEvent)=>{
           /* let x = event.clientX + this.mapManager.view.x - 12;
            let y = event.clientY + this.mapManager.view.y - 12;
            console.log(this.physicsManager.isPassable(x, y,
                this.physicsManager.entities[0]));*/
        })
    }
}