import {Entity} from "./Entity";
import {SpriteManager} from "../SpriteManager";
import {PhysicsManager} from "../PhysicsManager";
import {SoundManager} from "../SoundManager";

export class Explosion extends Entity{
    private ind: number = 1;

    constructor(spriteManager: SpriteManager, physicsManager: PhysicsManager, soundManager: SoundManager,
                x: number, y: number) {
        super(spriteManager, physicsManager, soundManager, x, y, 0);
        this.draw();
        setTimeout(()=>{this.processExplosion()}, Entity.updateSpeed);
        this.soundManager.play('/assets/boom.mp3');
    }

    private static getName(i: number){
        return `explosion_${i}`;
    }

    private processExplosion(){
        if (this.ind < 16){
            this.ind += 1;
            this.draw();
            setTimeout(()=>{this.processExplosion()}, Entity.updateSpeed);
        }
        else{
            this.destroy();
        }
    }

    get spriteName(): string {
        return Explosion.getName(this.ind);
    }

}