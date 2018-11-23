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
    private tLayer: Layer[];
    private xCount: number;
    private yCount: number;
    private tSize: { x: number, y: number };
    private mapSize: { x: number, y: number };
    private tilesets: loadedTileSet[];
    private imgLoadCount: number;
    private imgLoaded: boolean;
    private jsonLoaded: boolean;
    private view: {x: number, y: number, w: number; h: number};
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.imgLoadCount = 0;
        this.imgLoaded = false;
        this.jsonLoaded = false;
        this.view = {x: 0, y: 0, w: this.canvas.scrollWidth, h: this.canvas.scrollHeight}; // Size of view
        this.tSize = {x: 0, y: 0}; // Size of tile
        this.mapSize = {x: 0, y: 0}; // Size of map
        this.tilesets = [];
        this.tLayer = []
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
        this.mapSize.y = this.yCount * this.tSize.y;
        if (this.mapSize.x < this.view.w){
            this.view.x = -Math.floor(( this.view.w - this.mapSize.x) / 2 )
        }
        if (this.mapSize.y < this.view.h){
            this.view.y = -Math.floor((this.view.h - this.mapSize.y) / 2);
        }
        for (let i = 0; i < this.mapData.tilesets.length; i++) {
            this.loadTileSet(this.mapData.tilesets[i]);
        }
        this.jsonLoaded = true;
    }

    private loadTileSet(tileset: tileSet) {
        let img = new Image();
        img.onload = function () {
            this.imgLoadCount++;
            if (this.imgLoadCount === this.mapData.tilesets.length) {
                this.imgLoaded = true;
            }
        }.bind(this);
        img.src = MapManager.getAssetsPath(tileset.image);
        let t = tileset;
        let tiles = [];
        if (t.tiles) {
            for (let i = 0; i < t.tiles.length; i++) {
                tiles[t.tiles[i].id] = t.tiles[i]
            }
        }
        let ts = {
            firstgid: t.firstgid,
            image: img,
            name: t.name,
            xCount: Math.floor(t.imagewidth / this.tSize.x),
            yCount: Math.floor(t.imagewidth / this.tSize.y),
            tiles: tiles
        };
        this.tilesets.push(ts);
    }

    draw(){
        if (!this.isLoaded){
            setTimeout(()=>{this.draw()}, 100);
        }
        else{
            if (this.tLayer.length === 0){
                for (let id = 0; id < this.mapData.layers.length; id++){
                    let layer = this.mapData.layers[id];
                    if (layer.type === 'tilelayer'){
                        this.tLayer.push(layer);
                    }
                }
            }
            this.drawLoadedLayers();
        }
    }

    private drawLoadedLayers() {
        for (let j = 0; j < this.tLayer.length; j++) {
            for (let i = 0; i < this.tLayer[j].data.length; i++) {
                if (this.tLayer[j].data[i] !== 0) {
                    let tile = this.getTile(this.tLayer[j].data[i]);
                    let pX = (i % this.xCount) * this.tSize.x;
                    let pY = Math.floor(i / this.xCount) * this.tSize.y;
                    if (!this.isVisible(pX, pY, this.tSize.x, this.tSize.y))
                        continue;
                    pX -= this.view.x;
                    pY -= this.view.y;
                    this.ctx.drawImage(tile.img, tile.px, tile.py, this.tSize.x, this.tSize.y,
                        pX, pY, this.tSize.x, this.tSize.y);
                    /*this.ctx.rect(pX, pY, this.tSize.x, this.tSize.y);
                    this.ctx.stroke();*/
                    if (tile.info){
                        console.log(tile.info)
                    }
                }
            }
        }
    }

    getTile(tileIndex: number): {img: HTMLImageElement, px: number, py: number, info: tileInfo | undefined} {
        let tile = {
            img: null,
            px: 0,
            py: 0,
            info: undefined
        };
        let tileset = this.getTileset(tileIndex);
        tile.img = tileset.image;
        let id = tileIndex - tileset.firstgid;
        let x = id % tileset.xCount;
        let y = Math.floor(id/tileset.xCount);
        tile.px = x * this.tSize.x;
        tile.py = y * this.tSize.y;
        //console.log(id);
        tile.info = tileset.tiles[id];
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