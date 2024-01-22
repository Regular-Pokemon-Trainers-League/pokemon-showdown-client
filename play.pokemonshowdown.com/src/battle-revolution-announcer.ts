import { timers } from 'jquery';
import {BattleSound} from './battle-sound';

export class Announcer {

    constructor() {

    }

    announceAbility(ability: String) {
        if (ability == 'Liquid Ooze')
        {
            BattleSound.playEffect('audio/announcer/liquidooze.wav');
            // setTimeout(this.announceAbility, 10000);
        }
        return;
    }

}