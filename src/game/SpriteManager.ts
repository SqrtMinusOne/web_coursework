import {MapManager} from "./MapManager";
import {assertTSQualifiedName} from "babel-types";

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
    angle: number,
    hp: number
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
    private drawnBeams: {x1: number, y1: number, x2: number, y2: number, color: string}[];
    private drawnSprites: DrawnSprite[];
    private atlas: SpriteAtlas;
    private mapManager: MapManager;
    private ctx: CanvasRenderingContext2D;
    imgLoaded: boolean;
    jsonLoaded: boolean;

    constructor(canvas: HTMLCanvasElement, path: string, mapManager: MapManager){
        this.sprites = [];
        this.drawnSprites = [];
        this.drawnBeams = [];
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

    drawHpBar(x: number, y: number, w: number, hp: number, index: number, relative: boolean = false){
        if (relative) {
            x -= this.mapManager.view.x;
            y -= this.mapManager.view.y;
        }
        if (hp > 0) {
            this.ctx.beginPath();
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = "#ba0002";
            this.ctx.moveTo(x, y+2);
            this.ctx.lineTo(x + w, y+2);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.strokeStyle = "#00801a";
            this.ctx.moveTo(x, y+2);
            this.ctx.lineTo(x + w / 100 * hp, y+2);
            this.ctx.stroke();
            this.drawnSprites[index].hp = hp;
        }
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
            if (index === -1){
                index = this.addDrawnSprite(sprite);
            }
            else{
                if (this.drawnSprites[index]){
                    let oldSprite = this.drawnSprites[index];
                    sprite.hp = oldSprite.hp;
                    if (redraw) {
                        let sector = SpriteManager.getSector(oldSprite);
                        this.mapManager.redrawSector(sector.x, sector.y, sector.w, sector.h);
                    }
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
            if (hp !== -1) sprite.hp = hp;
            else if (hp === -1 && sprite.hp) hp = sprite.hp;
            this.drawHpBar(x, y, sprite.w, hp, index);
            if (redraw) {
                let sector = SpriteManager.getSector(sprite);
                this.redrawSpritesInSector(sector.x, sector.y, sector.w, sector.h, index);
            }
        }
        return index;
    }

    drawBeam(x1: number, y1: number, x2: number, y2: number, color: string, index: number = -1): number{
        if (index === -1){
            for (index = 0; index < this.drawnBeams.length; index++) {
                if (!this.drawnBeams[index])
                    break;
            }
        }
        this.drawnBeams[index] = {x1: x1, y1: y1, x2: x2, y2: y2, color: color};
        if (!this.isLoaded){
            setTimeout(()=>{
                this.drawBeam(x1, y1, x2, y2, color, index);
            }, 100);
            return index;
        }
        //  this.redrawSpritesInSector(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x1 - x2), Math.abs(y1 - y2));
        x1 -= this.mapManager.view.x;
        y1 -= this.mapManager.view.y;
        x2 -= this.mapManager.view.x;
        y2 -= this.mapManager.view.y;
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = color;
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        return index
    }

    removeBeam(index: number){
        let beam = this.drawnBeams[index];
        if (beam) {
            let x = Math.min(beam.x1, beam.x2);
            let y = Math.min(beam.y1, beam.y2);
            let w = Math.abs(beam.x2 - beam.x1);
            let h = Math.abs(beam.y2 - beam.y1);
            this.mapManager.redrawSector(x, y, w, h);
            this.redrawSpritesInSector(x, y, w, h);
            delete this.drawnBeams[index];
        }
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

    private static rotatePoint(x: number, y: number, cX: number, cY: number, angle: number): {x: number, y: number}{
        angle *= Math.PI / 180;
        let rX = Math.cos(angle) * (x - cX) - Math.sin(angle) * (y - cY) + cX;
        let rY = Math.sin(angle) * (x - cX) + Math.cos(angle) * (y - cY) + cY;
        return {x: rX, y: rY}
    }

    private static getSector(sprite: DrawnSprite): {x: number, y: number, w: number, h: number}{
        let cX = sprite.coords.x + sprite.w / 2;
        let cY = sprite.coords.y + sprite.h / 2;
        let p1 = SpriteManager.rotatePoint(sprite.coords.x, sprite.coords.y, cX, cY, sprite.angle);
        let p2 = SpriteManager.rotatePoint(sprite.coords.x, sprite.coords.y + sprite.h, cX, cY, sprite.angle);
        let p3 = SpriteManager.rotatePoint(sprite.coords.x + sprite.w, sprite.coords.y, cX, cY, sprite.angle);
        let p4 = SpriteManager.rotatePoint(sprite.coords.x + sprite.w, sprite.coords.y + sprite.h, cX, cY, sprite.angle);
        let x1 = Math.min(p1.x, p2.x, p3.x, p4.x);
        let y1 = Math.min(p1.y, p2.y, p3.y, p4.y);
        let x2 = Math.max(p1.x, p2.x, p3.x, p4.x);
        let y2 = Math.max(p1.y, p2.y, p3.y, p4.y);
        return{
            x: Math.floor(x1), y: Math.floor(y1), w: Math.ceil(x2 - x1), h: Math.ceil(y2 - y1)
        }
    }

    private static intersection(a1: number, a2: number, b1: number, b2: number): boolean{
        return ((b1 < a1) && (a1 < b2)) || ((b1 < a2) && (a2 < b2));

    }

    private redrawSpritesInSector(x: number, y: number, w: number, h: number,
                                  exclude: number = Number.MAX_VALUE){
        if (!this.drawnSprites)
            return;
        for (let i = 0; i < this.drawnSprites.length; i++){
            let drawnSprite = this.drawnSprites[i];
            if (drawnSprite && i!=exclude){
                let sector = SpriteManager.getSector(drawnSprite);
                if (SpriteManager.intersection(x, x + w, sector.x, sector.x + sector.w) &&
                    SpriteManager.intersection(y, y + h, sector.y, sector.y + sector.h)) {
                    this.drawSpite(drawnSprite.name, drawnSprite.coords.x, drawnSprite.coords.y, drawnSprite.angle, i, false);
                }
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
                return <LoadedSprite>(<any>Object).assign({}, loadedSprite);
        }
        return null
    }

    getSpriteByIndex(index: number): LoadedSprite{
        return this.sprites[index];
    }

}