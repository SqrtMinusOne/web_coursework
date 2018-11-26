import {MapManager} from "./MapManager";

interface Frame {
    x: number,
    y: number,
    w: number,
    h: number
}

interface Sprite{
    frame: Frame
    rotated: boolean,
    trimmed: boolean,
    spriteSourceSize: Frame,
    sourceSize: {
        w: number,
        h: number
    }
}

interface LoadedSprite{
    name: string,
    x: number,
    y: number,
    w: number,
    h: number
}

interface DrawnSprite extends LoadedSprite{
    coords: {
        x: number,
        y: number
    },
    angle: number
}

interface SpriteAtlas {
    frames: {
        [name: string]: Sprite
    },
    meta: {
        app: string,
        version: string,
        image: string,
        size: {
            w: number,
            h: number
        },
        scale: number
    }
}

export class SpriteManager{
    private image: HTMLImageElement;
    private sprites: LoadedSprite[];
    private drawnSprites: DrawnSprite[];
    private atlas: SpriteAtlas;
    private mapManager: MapManager;
    private ctx: CanvasRenderingContext2D;
    imgLoaded: boolean;
    jsonLoaded: boolean;

    constructor(canvas: HTMLCanvasElement, path: string, mapManager: MapManager){
        this.sprites = [];
        this.drawnSprites = [];
        this.imgLoaded = false;
        this.jsonLoaded = false;
        this.mapManager = mapManager;
        this.ctx = canvas.getContext("2d");
        this.loadAtlas(path);
        this.mapManager.drawCallback = ()=>{this.redrawAllSprites()};
    }

    get isLoaded(){
        return this.jsonLoaded && this.imgLoaded && this.mapManager.isLoaded;
    }

    private loadAtlas(path){
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200){
                this.parseAtlas(request.responseText);
            }
        }.bind(this);
        request.open("GET", path, true);
        request.send();
    }

    private parseAtlas(atlasJSON){
        this.atlas = JSON.parse(atlasJSON);
        this.image = new Image();
        this.image.onload = () => {
            this.imgLoaded = true;
        };
        this.image.src = '/assets/' + this.atlas.meta.image;
        for (let name in this.atlas.frames){
            let frame = this.atlas.frames[name].frame;
            let loadedSprite: LoadedSprite = {
                name: name,
                x: frame.x,
                y: frame.y,
                w: frame.w,
                h: frame.h
            };
            this.sprites.push(loadedSprite)
        }
        this.jsonLoaded = true;
    }

    drawSpite(name: string, x: number, y: number, angle: number = 0, index: number = -1,
              redraw: boolean = true, hp: number = -1): number{
        if (!this.isLoaded){
            if (index === -1){
                index = this.addDrawnSprite(null);
            }
            setTimeout(()=>{this.drawSpite(name, x, y, angle, index, redraw, hp)}, 100);
        }
        else{
            let sprite = <DrawnSprite>this.getSprite(name);
            if (!sprite) return;
            if (index === -1){
                index = this.addDrawnSprite(sprite);
            }
            else{
                if (this.drawnSprites[index] && redraw){
                    let oldSprite = this.drawnSprites[index];
                    this.mapManager.redrawSector(oldSprite.coords.x, oldSprite.coords.y,
                        oldSprite.h, oldSprite.w);
                }
                this.drawnSprites[index] = sprite;
            }
            sprite.coords = {x: x, y: y};
            sprite.angle = angle;
            if (!this.mapManager.isVisible(x, y, sprite.w, sprite.h)){
                return index;
            }
            x -= this.mapManager.view.x;
            y -= this.mapManager.view.y;
            this.ctx.save();
            this.ctx.translate(x + sprite.w / 2, y + sprite.h / 2);
            this.ctx.rotate(angle * Math.PI/180);
            this.ctx.drawImage(this.image, sprite.x, sprite.y, sprite.w, sprite.h,
                0 - sprite.w / 2 - 2, 0 - sprite.h / 2 - 1, sprite.w, sprite.h);
            this.ctx.restore();
            if (hp > 0) {
                this.ctx.beginPath();
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = "#ba0002";
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x + sprite.w, y);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.strokeStyle = "#00801a";
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x + sprite.w / 100 * hp, y);
                this.ctx.stroke();
            }
            this.redrawSpritesInSector(sprite.coords.x, sprite.coords.y, sprite.w, sprite.h, index);
        }
        return index;
    }

    drawProjectile(x1: number, y1: number, x2: number, y2: number, color: string){
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = color;
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    private addDrawnSprite(sprite: DrawnSprite | null){
        let index: number;
        for (index = 0; index < this.drawnSprites.length; index++){
            if (this.drawnSprites[index] === undefined){
                break;
            }
        }
        this.drawnSprites[index] = sprite;
        return index;
    }

    private redrawAllSprites(){
        for (let i = 0; i < this.drawnSprites.length; i++){
            let drawnSprite = this.drawnSprites[i];
            if (drawnSprite){
                this.drawSpite(drawnSprite.name, drawnSprite.coords.x, drawnSprite.coords.y, drawnSprite.angle, i, false);
            }
        }
    }
    private static intersection(a1: number, a2: number, b1: number, b2: number): boolean{
        return ((b1 < a1) && (a1 < b2)) || ((b1 < a2) && (a2 < b2));

    }

    private redrawSpritesInSector(x: number, y: number, w: number, h: number, exclude: number){
        if (!this.drawnSprites)
            return;
        for (let i = 0; i < this.drawnSprites.length; i++){
            let drawnSprite = this.drawnSprites[i];
            if (drawnSprite && i<exclude &&
                SpriteManager.intersection(x, x + w, drawnSprite.coords.x, drawnSprite.coords.x + drawnSprite.w) &&
                SpriteManager.intersection(y, y + h, drawnSprite.coords.y, drawnSprite.coords.y + drawnSprite.h)) {
                this.drawSpite(drawnSprite.name, drawnSprite.coords.x, drawnSprite.coords.y, drawnSprite.angle, i, false);
            }
        }
    }

    removeSprite(index: number){
        let sprite = this.drawnSprites[index];
        this.mapManager.redrawSector(sprite.coords.x, sprite.coords.y-5, sprite.w+5, sprite.h+5);
        this.redrawSpritesInSector(sprite.coords.x, sprite.coords.y, sprite.w, sprite.h, index);
        delete this.drawnSprites[index];
    }

    getSprite(name: string): LoadedSprite {
        for (let loadedSprite of this.sprites){
            if (loadedSprite.name === name)
                return loadedSprite;
        }
        return null
    }

    getSpriteByIndex(index: number): LoadedSprite{
        return this.sprites[index];
    }

}