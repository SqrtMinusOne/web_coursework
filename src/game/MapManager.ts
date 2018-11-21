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

interface mapJSON {
    height: number;
    infinite: boolean;
    layers: {
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
    }[]
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
    private tLayer: any;
    private xCount: number;
    private yCount: number;
    private tSize: { x: number, y: number };
    private mapSize: { x: number, y: number };
    private tilesets: loadedTileSet[];

    private imgLoadCount: number;
    private imgLoaded: boolean;
    private jsonLoaded: boolean;

    constructor(){
        this.imgLoadCount = 0;
        this.imgLoaded = false;
        this.jsonLoaded = false;
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
            img.src = this.mapData.tilesets[i].image;
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
            if (this.tLayer === null){
                for (let id = 0; id < this.mapData.layers.length; id++){

                }
            }
        }
    }
}