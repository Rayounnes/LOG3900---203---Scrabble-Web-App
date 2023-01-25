import { ChevaletService } from './chevalet.service';
import { ReserveService } from './reserve.service';

const MIN_NUMB_LETTERS_RESERVE = 7;

export class ExchangeLettersService {
    constructor(private reserveService: ReserveService) {}

    validateNumberOfLettersToExchange(lettersToExchange: string[]): boolean {
        return !(lettersToExchange.length > MIN_NUMB_LETTERS_RESERVE);
    }
    validateNumberReserveLetters(): boolean {
        return this.reserveService.letterReserveSize >= MIN_NUMB_LETTERS_RESERVE;
    }
    validateLowerCaseLetters(lettersToValidate: string[]): boolean {
        let isValid = true;
        for (const i of lettersToValidate) {
            if (i === i.toUpperCase() && i !== '*') {
                isValid = false;
                break;
            }
        }
        return isValid;
    }
    validatePositionOnRack(chevaletService: ChevaletService, lettersValidatePos: string[]): boolean {
        const lettersPositionsOnRack: number[] = chevaletService.getPositionsOfLettersOnRack(lettersValidatePos);
        return lettersValidatePos.length === lettersPositionsOnRack.length;
    }
    exchangeLetters(chevaletService: ChevaletService, lettersToSwap: string[]): void {
        const newExchangeLetters = this.reserveService.getLettersArray(lettersToSwap.length);
        const lettersPositionsOnRack: number[] = chevaletService.getPositionsOfLettersOnRack(lettersToSwap);
        for (let i = 0; i < newExchangeLetters.length; i++) {
            this.reserveService.addLetterToReserve(lettersToSwap[i]);
            chevaletService.lettersRack[lettersPositionsOnRack[i]] = newExchangeLetters[i].toLowerCase();
        }
    }
    exchangeLettersCommand(chevaletService: ChevaletService, lettersList: string[]) {
        if (!this.validateNumberReserveLetters())
            return {
                name: 'Commande impossible a réaliser : le nombre de lettres dans la réserve est insuffisant',
                type: 'system',
                display: 'local',
            };
        if (!this.validateNumberOfLettersToExchange(lettersList)) {
            return { name: 'Erreur Syntaxe : commande invalide, nombre de lettres à échanger non conforme', type: 'system', display: 'local' };
        }
        if (!this.validateLowerCaseLetters(lettersList))
            return { name: 'Erreur Syntaxe : nom de commande invalide, lettre majuscule détectée', type: 'system', display: 'local' };
        if (!this.validatePositionOnRack(chevaletService, lettersList))
            return { name: "Erreur Syntaxe : vous ne pouvez pas échanger une lettre que vous n'avez pas", type: 'system', display: 'local' };
        this.exchangeLetters(chevaletService, lettersList);
        return { name: '!échanger ' + lettersList.join(''), type: 'game', display: 'room' };
    }
}
