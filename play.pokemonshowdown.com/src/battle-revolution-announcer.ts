import {BattleSound} from './battle-sound';
import AnnounceDurations from 'announce'

export class Announcer {

    path = 'audio/announcer';

    constructor() {

    }

    announceAbility(ability: String): number {
        var duration;
        var fileName = '';
        var url = '';
        if (ability == 'Liquid Ooze')
        {
            fileName = 'liquidooze.mp3';
            url = this.path + '/' + fileName;
        }

        BattleSound.playEffect(url);
        duration = AnnounceDurations[fileName];
        console.log(duration);
        
        return duration ? duration*1000 : 0; // Milliseconds
    }

    
    announceAttack(attack: String): number {
        var duration;
        var fileName = '';
        var url = '';
        if(attack == 'woodhammer')
        {
            fileName = 'woodhammer.mp3'
            url = this.path + '/' + fileName;
        }

        BattleSound.playEffect(url);
        duration = AnnounceDurations[fileName];
        console.log(duration);
        return duration ? duration*1000 : 0; // Milliseconds;
    }
}

