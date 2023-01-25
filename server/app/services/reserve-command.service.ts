import { ReserveService } from './reserve.service';

export class ReserveCommandService {
    reserveLetters;
    constructor(private reserveService: ReserveService) {
        this.reserveLetters = this.reserveService.reserve;
    }
    reserveStateCommand() {
        let formatedReserve = '';
        const sortedReserve = new Map([...this.reserveLetters.entries()].sort());
        sortedReserve.delete('*');
        sortedReserve.set('*', this.quantityOfWhiteLetters());
        for (const [letter, quantity] of sortedReserve.entries()) {
            const newString = formatedReserve.concat(letter.toUpperCase() + ': ' + quantity.toString() + this.skipLine(letter));
            formatedReserve = newString;
        }
        return { name: formatedReserve, type: 'help', display: 'local' };
    }

    quantityOfWhiteLetters() {
        let quantity = this.reserveLetters.get('*');
        if (quantity === undefined) quantity = 0;
        return quantity;
    }

    skipLine(letter: string) {
        let nextLine = '\n';
        if (letter === '*') nextLine = '';
        return nextLine;
    }
}
