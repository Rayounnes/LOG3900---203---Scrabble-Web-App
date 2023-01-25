import {
    COMMANDS,
    EXCHANGE_PASS_PROB,
    MAX_LETTERS,
    PLACE_PROB,
    POINTS,
    SEVEN_TWELVE_POINTS_PROB,
    SIX_POINTS_LESS_PROB,
} from '@app/constants/constants';
import { Service } from 'typedi';

@Service()
export class RandomPlayerChoices {
    randomGameCommand(): COMMANDS {
        const randomChoice = Math.random();
        if (randomChoice < PLACE_PROB) return COMMANDS.Placer;
        else if (randomChoice < PLACE_PROB + EXCHANGE_PASS_PROB) return COMMANDS.Échanger;
        else return COMMANDS.Passer;
    }
    randomPlaceChoices(): POINTS {
        const randomChoice = Math.random();
        if (randomChoice < SIX_POINTS_LESS_PROB) return POINTS.SixOrLess;
        else if (randomChoice < SIX_POINTS_LESS_PROB + SEVEN_TWELVE_POINTS_PROB) return POINTS.SevenToTwelve;
        else return POINTS.ThirteenToEighteen;
    }
    randomExchangeChoices(): number {
        const randomNbLetters: number = Math.ceil(Math.random() * MAX_LETTERS);
        return randomNbLetters;
    }
}
