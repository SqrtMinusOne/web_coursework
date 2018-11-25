import {GameManager} from "./GameManager";
require('../styles/style.less');
// @ts-ignore
let canvas: HTMLCanvasElement = document.getElementById('main_canvas');
new GameManager(canvas);
