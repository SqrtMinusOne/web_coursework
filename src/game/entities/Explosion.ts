import {Entity} from "./Entity";
import {SpriteManager} from "../SpriteManager";
import {PhysicsManager} from "../PhysicsManager";

export class Explosion extends Entity{
    private ind: number = 0;

    constructor(spriteManager: SpriteManager, physicsManager: PhysicsManager, x: number, y: number) {
        super(spriteManager, physicsManager, x, y, 0);
        this.draw();
        setTimeout(()=>{this.processExplosion()}, 75);
    }

    private static getName(i: number){
        return `explosion_${i}`;
    }

    private processExplosion(){
        if (this.ind < 16){
            this.ind += 1;
            this.draw();
            setTimeout(()=>{this.processExplosion()}, 75);
        }
        else{
            this.destroy();
        }
    }

    get spriteName(): string {
        return Explosion.getName(this.ind);
    }

}