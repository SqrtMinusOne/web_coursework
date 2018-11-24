import {MapManager} from './MapManager'
import {SpriteManager} from "./SpriteManager";

require('../styles/style.less');
console.log("Hello, world!");
// @ts-ignore
let canvas: HTMLCanvasElement = document.getElementById('main_canvas');
let mapManager = new MapManager(canvas, '/assets/first.json');
let spriteManager = new SpriteManager(canvas, '/assets/sprites.json', mapManager);
mapManager.draw();
spriteManager.drawSpite('red_tank_1', 0, 0, 45);
