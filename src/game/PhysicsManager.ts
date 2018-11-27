import {Entity} from "./entities/Entity";
import {MapManager} from "./MapManager";
import {EntityWithAttack} from "./entities/EntityWithAttack";

export class PhysicsManager {
    private _mapManager: MapManager;
    private _entities: Entity[];

    constructor(mapManager: MapManager){
        this._mapManager = mapManager;
        this._entities = [];
    }

    addEntity(entity: Entity): Entity{
        this._entities[entity.index] = entity;
        return entity
    }

    removeEntity(entity: Entity){
        delete this._entities[entity.index];
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