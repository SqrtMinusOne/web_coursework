interface TileInfo {
    id: number,
    type: string
    animation: {
        duration: number,
        tileid: number
    }[]
}

interface TileSet {
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
    tiles: TileInfo[]
}

interface LoadedTileSet {
    firstgid: number,
    image: HTMLImageElement,
    name: string,
    xCount: number,
    yCount: number
    tiles: TileInfo[]
}

interface Layer {
    id: number;
    name: string;
    opacity: number;
    type: string;
    visible: boolean;
    x: number;
    y: number
}

interface TileLayer extends Layer {
    data: number[];
    height: number;
    width: number;
}

interface ObjectLayer extends Layer {
    draworder: string;
    objects: tileObject[];
}

interface tileObject {
    gid: number;
    height: number;
    id: number;
    name: string;
    rotation: number;
    type: string;
    visible: boolean;
    width: number;
    x: number;
    y: number;
}

interface MapJSON {
    height: number;
    infinite: boolean;
    layers: Layer[]
    nextlayerid: number,
    nextobjectid: number,
    orientation: string,
    renderorder: string,
    tiledversion: string,
    tileheight: number,
    tilesets: TileSet[]
    tilewidth: number;
    type: string;
    version: number;
    width: number;
}


interface LoadedTileInfo {
    img: HTMLImageElement,
    tilesetFirstGid: number,
    px: number,
    py: number,
    info: TileInfo | undefined
}

export class MapManager {
    private mapData: MapJSON;
    private tLayer: TileLayer[];
    private xCount: number;
    private yCount: number;
    private tSize: { x: number, y: number };
    public mapSize: { x: number, y: number };
    private tilesets: LoadedTileSet[];
    private imgLoadCount: number;
    private imgLoaded: boolean;
    private jsonLoaded: boolean;
    public view: {x: number, y: number, w: number; h: number};
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private animationIntervals;
    private restoreTiles: (()=>void)[];
    private _drawCallback: ()=>void;

    constructor(canvas: HTMLCanvasElement, path: string){
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.imgLoadCount = 0;
        this.imgLoaded = false;
        this.jsonLoaded = false;
        this.view = {x: 0, y: 0, w: this.canvas.scrollWidth, h: this.canvas.scrollHeight}; // Size of view
        this.tSize = {x: 0, y: 0}; // Size of tile
        this.mapSize = {x: 0, y: 0}; // Size of map
        this.tilesets = [];
        this.tLayer = [];
        this.animationIntervals = [];
        this.restoreTiles = [];
        this._drawCallback = null;
        this.loadMap(path);
    }

    set drawCallback(value: () => void) {
        this._drawCallback = value;
    }

    get isLoaded(){
        return this.imgLoaded && this.jsonLoaded ;
    }

    private loadMap(path: string) {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                this.parseMap(request.responseText);
            }
        }.bind(this);
        request.open('GET', path, true);
        request.send();
    }

    private parseMap(tilesJSON){
        this.mapData= JSON.parse(tilesJSON);
        this.xCount = this.mapData.width;
        this.yCount = this.mapData.height;
        this.tSize.x = this.mapData.tilewidth;
        this.tSize.y = this.mapData.tileheight;
        this.mapSize.x = this.xCount * this.tSize.x;
        this.mapSize.y = this.yCount * this.tSize.y;
        this.centerAtTile(0, 0);
        for (let tileset of this.mapData.tilesets) {
            this.loadTileSet(tileset);
        }
        this.jsonLoaded = true;
    }

    private loadTileSet(tileset: TileSet) {
        let img = new Image();
        if (!('image' in tileset)){
            console.log('Incorrect tileset');
            return;
        }
        img.onload = function () {
            this.imgLoadCount++;
            if (this.imgLoadCount === this.mapData.tilesets.length) {
                this.imgLoaded = true;
            }
        }.bind(this);
        img.src = '/assets/' + tileset.image;
        let t = tileset;
        let tiles = [];
        if (t.tiles) {
            for (let tile of t.tiles) {
                tiles[tile.id] = tile
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
            this.clearAnimations();
            this.ctx.clearRect(0, 0, this.view.h, this.view.w);
            if (this.tLayer.length === 0){
                for (let layer of this.mapData.layers){
                    if (layer.type === 'tilelayer'){
                        this.tLayer.push(<TileLayer>layer);
                    }
                }
            }
            for (let layer of this.tLayer) {
                for (let i = 0; i < layer.data.length; i++) {
                    this.drawTile(layer, i);
                }
            }
            if (this._drawCallback){
                this._drawCallback();
            }
        }
    }

    private drawTile(layer: TileLayer, tileIndex: number, noAnimate: boolean = false) {
        if (layer.data[tileIndex] !== 0 && tileIndex >= 0) {
            let tile = this.getTile(layer.data[tileIndex]);
            if (!tile)
                return;
            let pX = (tileIndex % this.xCount) * this.tSize.x;
            let pY = Math.floor(tileIndex / this.xCount) * this.tSize.y;
            if (!this.isVisible(pX, pY, this.tSize.x, this.tSize.y))
                return;
            pX -= this.view.x;
            pY -= this.view.y;
            this.ctx.drawImage(tile.img, tile.px, tile.py, this.tSize.x, this.tSize.y,
                pX, pY, this.tSize.x, this.tSize.y);
            /*this.ctx.rect(pX, pY, this.tSize.x, this.tSize.y);
            this.ctx.stroke();*/
            if (tile.info) {
                if (tile.info.animation && !noAnimate){
                    this.animateTile(layer, tileIndex, tile, pX, pY);
                }
            }
        }
    }

    private getTile(tileIndex: number): LoadedTileInfo {
        let tile = {
            img: null,
            tilesetFirstGid: 0,
            px: 0,
            py: 0,
            info: undefined
        };
        let tileset = this.getTileset(tileIndex);
        if (!tileset)
            return null;
        tile.img = tileset.image;
        let id = tileIndex - tileset.firstgid;
        let x = id % tileset.xCount;
        let y = Math.floor(id/tileset.xCount);
        tile.px = x * this.tSize.x;
        tile.py = y * this.tSize.y;
        tile.tilesetFirstGid = tileset.firstgid;
        tile.info = tileset.tiles[id];
        return tile
    }

    parseEntities(){
        if (!this.isLoaded){
            setTimeout(()=>{this.parseEntities()}, 100);
        }
        {
            for (let layer of this.mapData.layers){
                if (layer.type === 'objectgroup'){
                    for (let entity in <ObjectLayer>layer){
                        //TODO create GameManager Object
                    }
                }
            }
        }
    }

    private animateTile(layer: TileLayer, tileIndex: number, tile: LoadedTileInfo, pX: number, pY: number,
                        animation_index: number = 0, stack_index = -1){
        animation_index = animation_index % tile.info.animation.length;
        let animation = tile.info.animation[animation_index];
        layer.data[tileIndex] = animation.tileid + tile.tilesetFirstGid;
        this.ctx.beginPath();
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillRect(pX, pY, this.tSize.x, this.tSize.y);
        this.redrawTile(tileIndex);
        let expected_stack_index = stack_index === -1 ? this.animationIntervals.length : stack_index;
        let timerId = setTimeout(()=>{
            this.animateTile(layer, tileIndex, tile, pX, pY, ++animation_index, expected_stack_index)
        }, animation.duration);
        if (stack_index === -1){
            this.animationIntervals.push(timerId);
            this.restoreTiles.push(() =>{
                layer.data[tileIndex] = tile.info.animation[0].tileid + tile.tilesetFirstGid;
                clearTimeout(this.animationIntervals[expected_stack_index]);
            })
        }
        else{
            this.animationIntervals[expected_stack_index] = timerId;
        }
    }

    redrawSector(x: number, y: number, w: number, h: number){
        if (!this.isLoaded){
            setTimeout(()=>{this.redrawSector(x, y, w, h)}, 100);
            return;
        }
        this.mapToSector(x, y, w, h, (x, y)=>{
            this.redrawTile(this.getTileIndex(x, y), true);
        });
    }

    private redrawTile(tileIndex: number, noAnimate: boolean = true) {
        for (let layer of this.tLayer) {
            this.drawTile(layer, tileIndex, noAnimate);
        }
    }

    getSectorType(x: number, y: number, w: number, h: number): string[]{
        if (!this.isLoaded){
            console.log('Tried to get sector type before loading');
            return;
        }
        let res = [];
        this.mapToSector(x, y, w, h, (x, y)=>{
            for (let layer of this.tLayer){
                let tile = this.getTile(layer.data[this.getTileIndex(x, y)]);
                if (tile && tile.info && tile.info.type){
/*                    this.ctx.fillStyle = "green";
                    this.ctx.fillRect(x - this.view.x, y - this.view.y, w, h);*/
                    if ((res.indexOf(tile.info.type) == -1))
                        res.push(tile.info.type);
                }
            }
        });
        return res;
    }

    mapToSector(x: number, y: number, w: number, h: number, callback: (x: number, y: number)=>void){
        let cx = Math.floor(x / this.tSize.x) * this.tSize.x;
        let cy = Math.floor(y / this.tSize.y)*  this.tSize.y;
        let cw = Math.ceil((w + x - cx) / this.tSize.x) * this.tSize.x;
        let ch = Math.ceil((h + y - cy ) / this.tSize.y) * this.tSize.y;
        cx = cx < 0 ? 0 : cx;
        cy = cy < 0 ? 0 : cy;
        cw = cx + cw > this.mapSize.x ? this.mapSize.x - cx : cw;
        ch = cy + ch > this.mapSize.y ? this.mapSize.y - cy : ch;
/*        this.ctx.strokeStyle = "red";
        this.ctx.rect(x - this.view.x,y - this.view.y, w, h);
        this.ctx.stroke();
        this.ctx.strokeStyle = "black";
        this.ctx.rect(cx - this.view.x, cy - this.view.y, cw, ch);
        this.ctx.stroke();*/
        for (let dx=0; dx<cw; dx+=this.tSize.x){
            for (let dy=0; dy<ch; dy+=this.tSize.y){
                callback(cx + dx, cy + dy)
            }
        }
    }

    private clearAnimations(){
        for (let restoreFunc of this.restoreTiles){
            restoreFunc();
        }
        this.animationIntervals.length = 0;
        this.restoreTiles.length = 0;
    }

    getTileset(tileIndex: number): LoadedTileSet {
        for (let i = this.tilesets.length - 1; i >= 0; i--){
            if (this.tilesets[i].firstgid <= tileIndex){
                return this.tilesets[i];
            }
        }
        return null
    }

    getTilesetIds(x: number, y: number){
        let res:number[] = [];
        for (let layer of this.tLayer) {
            let id = this.getTileIndex(x, y);
            res.push(layer.data[id]);
        }
        return res;
    }

    private getTileIndex(x: number, y: number) {
        if (x >= 0 && x <= this.mapSize.x && y >= 0 && y <= this.mapSize.y)
            return (Math.floor(y / this.tSize.y)) * this.xCount + Math.floor(x / this.tSize.x);
        else
            return -1;
    }

    centerAtCoords(x:number, y: number){
        if (this.mapSize.x < this.view.w)
            this.view.x = -Math.floor(( this.view.w - this.mapSize.x) / 2 );
        else if(x < this.view.w / 2)
            this.view.x = 0;
        else if(x > this.mapSize.x - this.view.w / 2)
            this.view.x = this.mapSize.x - this.view.w;
        else
            this.view.x = x - (this.view.w / 2);
        if (this.mapSize.y < this.view.h)
            this.view.y = -Math.floor((this.view.h - this.mapSize.y) / 2);
        else if(y < this.view.h / 2)
            this.view.y = 0;
        else if(y > this.mapSize.y - this.view.h / 2)
            this.view.y = this.mapSize.y - this.view.h;
        else
            this.view.y = y - (this.view.h / 2);
    }

    centerAtTile(x: number, y: number){
        this.centerAtCoords(x * this.tSize.x, y * this.tSize.y)
    }

    scrollByY(deltaY: number){
        if (this.mapSize.y > this.view.h){
            this.centerAtCoords(this.view.x, this.view.y + this.view.h /2 + deltaY);
            this.draw();
        }
    }

    isVisible(x: number, y: number, width: number, height: number): boolean {
        return !(x + width < this.view.x || y + height < this.view.y ||
            x > this.view.x + this.view.w || y > this.view.y + this.view.h);

    }
}