console.log("Hello, world!");
// @ts-ignore
let map = new MapManager();
// @ts-ignore
let canvas: HTMLCanvasElement = document.getElementById('main_canvas');
let ctx = canvas.getContext('2d');
map.loadMap('/assets/first.json');
map.draw(ctx);
