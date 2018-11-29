import {GameManager} from "./GameManager";
import {SoundManager} from './SoundManager'

require('../styles/style.less');
require('../../bower_components/w3css-v3/w3.css');
let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('main_canvas');
let s: SoundManager = new SoundManager();

let gameManager = new GameManager(canvas);
gameManager.table_fields = [
    [null, document.getElementById('reb_score'), document.getElementById('fed_score')],
    [null, document.getElementById('reb_energy'), document.getElementById('fed_energy')],
    [null, document.getElementById('reb_max_energy'), document.getElementById('fed_max_energy')]
];

document.getElementById('fed_chosen').onclick = function () {
    document.getElementById('side').innerText = "Side chosen";
/*    document.getElementById('reb_chosen').remove();
    document.getElementById('fed_chosen').classList.remove('w3-half');
    document.getElementById('fed_chosen').classList.add('w3-block');
    document.getElementById('fed_chosen').setAttribute('disabled', '');
    */
    document.getElementById('game_process').removeAttribute('hidden');
    document.getElementById('main_info').classList.remove('w3-red');
    document.getElementById('main_info').classList.add('w3-blue');
    gameManager.chosen_team = 2;
};

document.getElementById('reb_chosen').onclick = function () {
    document.getElementById('side').innerText = "Side chosen";
/*    document.getElementById('fed_chosen').remove();
    document.getElementById('reb_chosen').classList.remove('w3-half');
    document.getElementById('reb_chosen').classList.add('w3-block');
    document.getElementById('reb_chosen').setAttribute('disabled', '');
    */
    document.getElementById('game_process').removeAttribute('hidden');
    document.getElementById('main_info').classList.remove('w3-blue');
    document.getElementById('main_info').classList.add('w3-red');
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
        case 'radar': name = 'radar'; break;
    }
    gameManager.chosen_name = name;
    gameManager.chosen_type = type;
};


