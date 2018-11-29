import {Entity} from "./entities/Entity";
import {MapManager} from "./MapManager";
import {SpriteManager} from "./SpriteManager";

export class PhysicsManager {
    private _mapManager: MapManager;
    private _spriteManager: SpriteManager;
    private passableMap: number[][];
    private _entities: Entity[];
    private _destroyCallback: (entity: Entity)=>void;

    constructor(mapManager: MapManager, spriteManager: SpriteManager){
        this._mapManager = mapManager;
        this._entities = [];
        this._spriteManager = spriteManager;
        this.loadMapData();
    }

    private loadMapData(){
        if (!this._mapManager.isLoaded){
            setTimeout(this.loadMapData.bind(this), 100);
        }
        else{
            this.passableMap = this._mapManager.getPassableMap();
        }
    }

    getMapData(): number[][]{
        if (!this.passableMap)
            return null;
        let map = JSON.parse(JSON.stringify(this.passableMap));
        for (let entity of this._entities){
            if (entity.isDestructible){
                let sector = this.getShrinkedRelCoords(entity);
                for (let i = 0; i < sector.w; i++)
                    for (let j = 0; j < sector.h; j++)
                        map[sector.x + i][sector.y+j] = -2;
            }
        }
        return map;
    }

    getActualRelCoords(entity: Entity): {x: number, y: number, w: number, h: number}{
        let sector = SpriteManager.getSector(entity.x, entity.y, entity.w, entity.h, entity.angle);
        let x = Math.floor(sector.x / this._mapManager.tSize.x);
        let y = Math.floor(sector.y / this._mapManager.tSize.y);
        let w = Math.ceil((sector.w + sector.x - x) / this._mapManager.tSize.x) - x;
        let h = Math.ceil((sector.h + sector.y - y ) / this._mapManager.tSize.y) - y;
        return {x: x, y: y, w: w, h: h}
    }

    getShrinkedRelCoords(entity: Entity): {x: number, y: number, w: number, h: number}{
        let sector = this.shrinkEntitySector(entity);
        let x = Math.floor(sector.x / this._mapManager.tSize.x);
        let y = Math.floor(sector.y / this._mapManager.tSize.y);
        let w = Math.ceil((sector.w + sector.x - x) / this._mapManager.tSize.x) - x;
        let h = Math.ceil((sector.h + sector.y - y ) / this._mapManager.tSize.y) - y;
        return {x: x, y: y, w: w, h: h}
    }

    addEntity(entity: Entity): Entity{
        this._entities[entity.index] = entity;
        return entity
    }

    removeEntity(entity: Entity){
        this._destroyCallback(entity);
        delete this._entities[entity.index];
    }

    copyPassableMap(){
        return JSON.parse(JSON.stringify(this.passableMap));
    }

    algLee(x1, y1, x2, y2): {dx: number, dy: number}[] | null{
        function mark(map, x, y, m): boolean{
            if (check(map, x, y)){
                map[x][y] = m;
                return true;
            }
            return false;
        }
        function check(map, x, y, m = -1): boolean{
            if (x >= 0 && y >= 0 && x < map.length && y < map[0].length){
                if (map[x][y] === m) {
                    return true
                }
            }
            return false;
        }
        function getNeighbours(map, x, y, m = -1): {x: number, y: number}[]{
            let res = [];
            if (check(map, x-1, y, m)) res.push({x: x-1, y: y});
            if (check(map, x+1, y, m)) res.push({x: x+1, y: y});
            if (check(map, x, y-1, m)) res.push({x: x, y: y-1});
            if (check(map, x, y+1, m)) res.push({x: x, y: y+1});
            return res;
        }
        //let map = this.getMapData();
        let map = this.copyPassableMap();
        if (!map)
            return null;
        let d: number = 0;
        map[x1][y1] = d;
        let pathFound: boolean = false;
        let allChecked: boolean = false;
        let marksSet: boolean = false;
        while (!pathFound || allChecked || !marksSet) {
            allChecked = true;
            marksSet = false;
            for (let x = 0; x < map.length; x++) {
                for (let y = 0; y < map[0].length; y++) {
                    allChecked = allChecked && map[x][y] === -1;
                    if (map[x][y] === d){
                        for (let n of getNeighbours(map, x, y)){
                            marksSet = mark(map, n.x, n.y, d+1) || marksSet;
                        }
                    }
                }
            }
            pathFound = (map[x2][y2]) > 0;
            d++;
            if (d > 70)
                break;
        }
        if (!pathFound)
            return null;
        else{
            let res: {dx: number, dy: number}[] = [];
            let x = x2; let y = y2;
            while(x != x1 || y != y1){
                let cellMark = map[x][y];
                let neighbour = getNeighbours(map, x, y, cellMark-1)[0];
                res.push({
                    dx: x - neighbour.x,
                    dy: y - neighbour.y
                });
                x = neighbour.x; y = neighbour.y;
            }
            PhysicsManager.niceMapOut(map);
            res = res.reverse();
            return res;
        }
    }

    static niceMapOut(map: number[][]){
        for (let y = 0; y < map[0].length; y++) {
            let str: string = '';
            for (let x = 0; x < map.length; x++){
                let elem = map[x][y].toString();
                while (elem.length < 2)
                    elem = ' ' + elem;
                str += elem + ', ';
            }
            console.log(str);
        }
    }

    isPassable(x: number, y: number, entity: Entity): boolean{
        if (x + entity.w > this._mapManager.mapSize.x ||
            y + entity.h > this._mapManager.mapSize.y ||  x < 0 || y < 0){ // Map size
            return false;
        }
        let es = this.shrinkEntitySector(entity);
        let types = this._mapManager.getSectorType(es.x, es.y, es.w, es.h); // Block type
        if (types.indexOf('imp') !== -1){
            return false;
        }
        for (let ent of this.entities) {
            if (ent !== entity && ent.getDistanceTo(entity.x, entity.y) < ent.w){
                return false;
            }
        }
        return true;
    }

    shrinkEntitySector(entity: Entity): {x: number, y: number, w: number, h: number}{
        let sector = {x: 0, y: 0, w: 0, h: 0};
        let dX = entity.x % this._mapManager.tSize.x;
        let dY = entity.y % this._mapManager.tSize.y;
        sector.x = Math.floor(entity.x / this._mapManager.tSize.x) * this._mapManager.tSize.x;
        sector.y = Math.floor(entity.y / this._mapManager.tSize.y) * this._mapManager.tSize.y;
        if (dX > this._mapManager.tSize.x / 2){
            sector.x += this._mapManager.tSize.x;
        }
        if (dY > this._mapManager.tSize.y / 2){
            sector.y += this._mapManager.tSize.y;
        }
        sector.w = this._mapManager.tSize.x;
        sector.h = this._mapManager.tSize.y;
        return sector
    }

    entitiesInRange(x: number, y: number, r: number): Entity[]{
        let res: Entity[] = [];
        for (let entity of this._entities){
            if (entity){
                if (entity.getDistanceTo(x,y) < r){
                    res.push(entity);
                }
            }
        }
        return res;
    }

    get entities(): Entity[] {
        let res = [];
        for (let entity of this._entities) {
            if (entity)
                res.push(entity)
        }
        return res;
    }

    set destroyCallback(value: (entity: Entity) => void) { this._destroyCallback = value; }
}