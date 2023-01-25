import { expect, assert } from 'chai';
import { ReserveService } from './reserve.service';

describe('ReserveService', () => {
    let service: ReserveService;

    beforeEach(() => {
        service = new ReserveService();
    });

    it('should be created', () => {
        assert.isDefined(service);
    });

    it('removeLetter decrement the value of the letter in the map', () => {
        const letter = 'A';
        const oldValue = service.reserve.get(letter);
        service.removeLetter(letter);
        expect(Number(oldValue)).to.eql(Number(service.reserve.get(letter)) + 1);
    });

    it('the total size of the reserve should diminish of one when removing a letter', () => {
        service.removeLetter('a');
        const expectedTotalSizeOfReserve = 101;
        const totalSizeOfReserve = service.letterReserveSize;
        expect(totalSizeOfReserve).to.eql(expectedTotalSizeOfReserve);
    });

    it('the total size of the reserve should increase of one when adding a letter', () => {
        service.addLetterToReserve('x');
        const expectedTotalSizeOfReserve = 103;
        const totalSizeOfReserve = service.letterReserveSize;
        expect(totalSizeOfReserve).to.eql(expectedTotalSizeOfReserve);
    });

    it('getLetter should decrease by one the total size of the reserve', () => {
        service.getLetter();
        const expectedTotalSizeOfReserve = 101;
        const totalSizeOfReserve = service.letterReserveSize;
        expect(totalSizeOfReserve).to.eql(expectedTotalSizeOfReserve);
    });
    it('getLetter should return no letter if reserve size is 0', () => {
        service.letterReserveSize = 0;
        const letter: string = service.getLetter();
        expect(letter).to.eql('');
    });
    it('getLetter should return a letter if reserve size is not 0', () => {
        const letter = service.getLetter();
        expect(typeof letter).to.eql('string');
    });

    it('getLettersArray should decrease the totalSizeOfReserve by the amount of letter passed in argument', () => {
        const nbOfRandomLettersWanted = 5;
        service.getLettersArray(nbOfRandomLettersWanted);
        const expectedTotalSizeOfReserve = 97;
        const totalSizeOfReserve = service.letterReserveSize;
        expect(totalSizeOfReserve).to.eql(expectedTotalSizeOfReserve);
    });

    it('getFullLetterReserve should return the reserve containing all the letters', () => {
        const exptectedFullReserveSize = 102;
        const fullReserveSize = service.getFullLetterReserve().length;
        expect(fullReserveSize).to.eql(exptectedFullReserveSize);
    });
});
