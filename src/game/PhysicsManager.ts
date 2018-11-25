import {Entity} from "./entities/Entity";
import {MapManager} from "./MapManager";

export class PhysicsManager {
    private _mapManager: MapManager;
    private _entities: Entity[];

    constructor(mapManager: MapManager){
        this._mapManager = mapManager;
        this._entities = [];
    }

    addEntity(entity: Entity){
        this._entities[entity.index] = entity;
    }

    removeEntity(entity: Entity){
        delete this._entities[entity.index];
    }

    isPassable(x: number, y: number, entity: Entity): boolean{
        if (x + entity.w > this._mapManager.mapSize.x || y + entity.h > this._mapManager.mapSize.y ||
            x < 0 || y < 0){
            return false;
        }
        let types = this._mapManager.getSectorType(x, y, entity.w, entity.h);
        return types.indexOf('imp') === -1;
    }

    get entities(): Entity[] {
        return this._entities;
    }
}