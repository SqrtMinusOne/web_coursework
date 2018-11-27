import {GameManager} from "./GameManager";

require('../styles/style.less');
require('../../bower_components/w3css-v3/w3.css');
// @ts-ignore
let canvas: HTMLCanvasElement = document.getElementById('main_canvas');
let gameManager = new GameManager(canvas);

document.getElementById('fed_chosen').onclick = function () {
    document.getElementById('side').innerText = "Side chosen";
/*    document.getElementById('reb_chosen').remove();
    document.getElementById('fed_chosen').classList.remove('w3-half');
    document.getElementById('fed_chosen').classList.add('w3-block');
    document.getElementById('game_process').removeAttribute('hidden');
    document.getElementById('main_info').classList.add('w3-blue');
    document.getElementById('fed_chosen').setAttribute('disabled', '');*/
    gameManager.chosen_team = 2;
};

document.getElementById('reb_chosen').onclick = function () {
    document.getElementById('side').innerText = "Side chosen";
/*    document.getElementById('fed_chosen').remove();
    document.getElementById('reb_chosen').classList.remove('w3-half');
    document.getElementById('reb_chosen').classList.add('w3-block');
    document.getElementById('game_process').removeAttribute('hidden');
    document.getElementById('main_info').classList.add('w3-red');
    document.getElementById('reb_chosen').setAttribute('disabled', '');*/
    gameManager.chosen_team = 1;
};

document.getElementById('object_select').onchange = function () {
    let select = <HTMLSelectElement>document.getElementById('object_select');
    let value = select.options[select.selectedIndex].value;
    let name = 'tank';
    let type = 1;
    switch (value) {
        case 'turret': name = 'turret'; break;
        case 'tank_1': type = 1; break;
        case 'tank_2': type = 2; break;
        case 'tank_3': type = 3; break;
        case 'tank_4': type = 4; break;
    }
    gameManager.chosen_name = name;
    gameManager.chosen_type = type;
};


