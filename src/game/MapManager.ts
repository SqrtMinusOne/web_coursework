interface tileInfo {
    id: number,
    type: string
    animation: {
        duration: number,
        tileid: number
    }[]
}

interface tileSet {
    columns: number,
    firstgid: number,
    image: string,
    imageheight: number,
    imagewidth: number,
    margin: number,
    name: string,
    spacing: number,
    tilecount: number,
    tileheight: number,
    tiles: tileInfo[]
}

interface loadedTileSet {
    firstgid: number,
    image: HTMLImageElement,
    name: string,
    xCount: number,
    yCount: number
    tiles: tileInfo[]
}

interface Layer {
    data: number[];
    height: number;
    id: number;
    name: string;
    opacity: number;
    type: string;
    visible: boolean;
    width: number;
    x: number;
    y: number
}

interface mapJSON {
    height: number;
    infinite: boolean;
    layers: Layer[]
    nextlayerid: number,
    nextobjectid: number,
    orientation: string,
    renderorder: string,
    tiledversion: string,
    tileheight: number,
    tilesets: tileSet[]
    tilewidth: number;
    type: string;
    version: number;
    width: number;
}


export class MapManager {
    private mapData: mapJSON;
    private tLayer: Layer;
    private xCount: number;
    private yCount: number;
    private tSize: { x: number, y: number };
    private mapSize: { x: number, y: number };
    private tilesets: loadedTileSet[];
    private imgLoadCount: number;
    private imgLoaded: boolean;
    private jsonLoaded: boolean;
    private view: {x: number, y: number, w: number; h: number};

    constructor(){
        this.imgLoadCount = 0;
        this.imgLoaded = false;
        this.jsonLoaded = false;
        this.view = {x: 0, y: 0, w: 800, h: 600};
        this.tSize = {x: 0, y: 0};
        this.mapSize = {x: 0, y: 0};
        this.tilesets = [];
    }

    private static getAssetsPath(path: string): string{
        return '/assets/' + path;
    }

    get isLoaded(){
        return this.imgLoaded && this.jsonLoaded;
    }

    loadMap(path: string) {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                this.parseMap(request.responseText);
            }
        }.bind(this);
        request.open('GET', path, true);
        request.send();
    }

    parseMap(tilesJSON){
        this.mapData= JSON.parse(tilesJSON);
        this.xCount = this.mapData.width;
        this.yCount = this.mapData.height;
        this.tSize.x = this.mapData.tilewidth;
        this.tSize.y = this.mapData.tileheight;
        this.mapSize.x = this.xCount * this.tSize.x;
        this.mapSize.y = this.xCount * this.tSize.y;
        for (let i = 0; i < this.mapData.tilesets.length; i++) {
            let img = new Image();
            img.onload = function () {
                this.imgLoadCount++;
                if (this.imgLoadCount === this.mapData.tilesets.length){
                    this.imgLoaded = true;
                }
            }.bind(this);
            img.src = MapManager.getAssetsPath(this.mapData.tilesets[i].image);
            let t = this.mapData.tilesets[i];
            let ts = {
                firstgid: t.firstgid,
                image: img,
                name: t.name,
                xCount: Math.floor(t.imagewidth / this.tSize.x),
                yCount: Math.floor(t.imagewidth / this.tSize.y),
                tiles: t.tiles,
            };
            this.tilesets.push(ts);
        }
        this.jsonLoaded = true;
    }

    draw(ctx: CanvasRenderingContext2D){
        if (!this.isLoaded){
            setTimeout(()=>{this.draw(ctx)}, 100);
        }
        else{
            if (!this.tLayer){
                for (let id = 0; id < this.mapData.layers.length; id++){
                    let layer = this.mapData.layers[id];
                    if (layer.type === 'tilelayer'){
                        this.tLayer = layer;
                        break;
                    }
                }
            }
            for (let i = 0; i < this.tLayer.data.length; i++){
                if (this.tLayer.data[i] !== 0){
                    let tile = this.getTile(this.tLayer.data[i]);
                    let pX = (i % this.xCount) * this.tSize.x;
                    let pY = Math.floor(i / this.xCount) * this.tSize.y;
                    if (!this.isVisible(pX, pY, this.tSize.x, this.tSize.y))
                        continue;
                    pX -= this.view.x;
                    pY = this.view.y;
                    ctx.drawImage(tile.img, tile.px, tile.py, this.tSize.x, this.tSize.y, pX, pY, this.tSize.x, this.tSize.y)
                }
            }
        }
    }

    getTile(tileIndex: number): {img: HTMLImageElement, px: number, py: number} {
        let tile = {
            img: null,
            px: 0,
            py: 0
        };
        let tileset = this.getTileset(tileIndex);
        tile.img = tileset.image;
        let id = tileIndex - tileset.firstgid;
        let x = id % tileset.xCount;
        let y = Math.floor(id/tileset.xCount);
        tile.px = x * this.tSize.x;
        tile.py = y * this.tSize.y;
        return tile
    }

    getTileset(tileIndex: number): loadedTileSet {
        for (let i = this.tilesets.length - 1; i >= 0; i--){
            if (this.tilesets[i].firstgid <= tileIndex){
                return this.tilesets[i];
            }
        }
        return null
    }

    private isVisible(x: number, y: number, width: number, height: number): boolean {
        return !(x + width < this.view.x || y + height < this.view.y ||
            x > this.view.x + this.view.w || y > this.view.y + this.view.h);
    }
}