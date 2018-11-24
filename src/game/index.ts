import {MapManager} from './MapManager'
import {SpriteManager} from "./SpriteManager";
import {EventsManager} from "./EventsManager";

require('../styles/style.less');
console.log("Hello, world!");
// @ts-ignore
let canvas: HTMLCanvasElement = document.getElementById('main_canvas');
let mapManager = new MapManager(canvas, '/assets/first.json');
let spriteManager = new SpriteManager(canvas, '/assets/sprites.json', mapManager);
let eventsManager = new EventsManager(canvas, mapManager);
mapManager.draw();
spriteManager.drawSpite('red_tank_1', 0, 0, 45);
spriteManager.drawSpite('red_tank_2', 64, 0, 90);
spriteManager.drawSpite('red_tank_3', 64, 32, -45);
