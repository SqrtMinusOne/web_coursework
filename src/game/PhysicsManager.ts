import {Entity} from "./entities/Entity";
import {MapManager} from "./MapManager";
import {EntityWithAttack} from "./entities/EntityWithAttack";

export class PhysicsManager {
    private _mapManager: MapManager;
    private passableMap: number[][];
    private _entities: Entity[];

    constructor(mapManager: MapManager){
        this._mapManager = mapManager;
        this._entities = [];
        this.getMapData();
    }

    private getMapData(){
        if (!this._mapManager.isLoaded){
            setTimeout(this.getMapData.bind(this), 100);
        }
        else{
            this.passableMap = this._mapManager.getPassableMap();
            this.algLee(0, 0, 9, 39);
        }
    }

    addEntity(entity: Entity): Entity{
        this._entities[entity.index] = entity;
        return entity
    }

    removeEntity(entity: Entity){
        delete this._entities[entity.index];
    }

    algLee(x1, y1, x2, y2){
        function mark(map, x, y, m){
            if (x >= 0 && y >= 0 && x < map.length && y < map[0].length){
                if (map[x][y] === -1)
                    map[x][y] = m;
            }
        }
        let map = JSON.parse(JSON.stringify(this.passableMap));
        let d: number = 0;
        map[x1][y1] = d;
        let pathFound: boolean = false;
        let allChecked: boolean = false;
        while (!pathFound || allChecked) {
            allChecked = true;
            for (let x = 0; x < map.length; x++) {
                for (let y = 0; y < map[0].length; y++) {
                    allChecked = allChecked && map[x][y] === -1;
                    if (map[x][y] === d){
                        mark(map, x-1, y, d+1);
                        mark(map,x+1, y, d+1);
                        mark(map, x, y-1, d+1);
                        mark(map, x,y+1, d+1);
                    }
                }
            }
            pathFound = (map[x2][y2]) > 0;
            d++;
            console.log(JSON.parse(JSON.stringify(map)));
            if (d > 70)
                break;
        }
    }

    isPassable(x: number, y: number, entity: Entity): boolean{
        if (x + entity.w > this._mapManager.mapSize.x ||
            y + entity.h > this._mapManager.mapSize.y ||  x < 0 || y < 0){ // Map size
            return false;
        }
        let types = this._mapManager.getSectorType(x, y, entity.w, entity.h); // Block type
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
}