import {BattleSound} from './battle-sound';
import AnnounceDurations from 'announce'

export class Announcer {

    url = "https://rptl.us"
    constructor() {

    }

    announceAbility(ability: String): number {
        var duration;
        var path = 'audio/announcer';
        var fileName = '';
        var url = '';
        if (ability == 'Liquid Ooze')
        {
            fileName = 'liquidooze.wav';
            url = path + '/' + fileName;
        }

        BattleSound.playEffect(url);
        duration = AnnounceDurations[fileName];
        console.log(duration);
        
        return duration ? duration*1000 : 0; // Milliseconds
    }

}