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
    private atlas: SpriteAtlas;
    private mapManager: MapManager;
    private ctx: CanvasRenderingContext2D;
    imgLoaded: boolean;
    jsonLoaded: boolean;

    constructor(canvas: HTMLCanvasElement, path: string, mapManager: MapManager){
        this.sprites = [];
        this.imgLoaded = false;
        this.jsonLoaded = false;
        this.mapManager = mapManager;
        this.ctx = canvas.getContext("2d");
        this.loadAtlas(path);
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

    drawSpite(name: string, x: number, y: number, angle: number = 0){
        if (!this.isLoaded){
            setTimeout(()=>{this.drawSpite(name, x, y, angle)}, 100);
            x -= this.mapManager.view.x;
            y -= this.mapManager.view.y;
        }
        else{
            let sprite = this.getSprite(name);
            x -= this.mapManager.view.x;
            y -= this.mapManager.view.y;
            if (!this.mapManager.isVisible(x, y, sprite.w, sprite.h)){
                return;
            }
            this.ctx.save();
            this.ctx.translate(x + sprite.w / 2, y + sprite.h / 2);
            this.ctx.rotate(angle * Math.PI/180);
            this.ctx.drawImage(this.image, sprite.x, sprite.y, sprite.w, sprite.h,
                0 - sprite.w / 2, 0 - sprite.h / 2, sprite.w, sprite.h);
            this.ctx.restore();
        }
    }

    private getSprite(name: string): LoadedSprite {
        for (let loadedSprite of this.sprites){
            if (loadedSprite.name === name)
                return loadedSprite;
        }
        return null
    }
}