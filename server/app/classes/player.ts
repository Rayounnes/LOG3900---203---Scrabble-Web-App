import { ChevaletService } from '@app/services/chevalet.service';
import { ReserveService } from '@app/services/reserve.service';
import { HintWordsService } from '@app/services/hint-words.service';
import { ValidationCountingWordsService } from '@app/services/counting-validating-points.service';
import { Board } from './board';
export class Player {
    score: number = 0;
    lettersLeft: number;
    lettersRack: ChevaletService;
    hintWords: HintWordsService;
    constructor(reserveLetters: ReserveService, board: Board, validationService: ValidationCountingWordsService) {
        this.lettersRack = new ChevaletService(reserveLetters);
        this.lettersRack.fillRackWithLetters();
        this.lettersLeft = this.lettersRack.lettersRack.length;
        this.hintWords = new HintWordsService(this.lettersRack, validationService, board);
    }
}
