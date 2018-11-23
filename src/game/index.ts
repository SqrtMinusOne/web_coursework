import {MapManager} from './MapManager'
require('../styles/style.less');
console.log("Hello, world!");
// @ts-ignore
let canvas: HTMLCanvasElement = document.getElementById('main_canvas');
let map = new MapManager(canvas);
map.loadMap('/assets/first.json');
map.draw();
