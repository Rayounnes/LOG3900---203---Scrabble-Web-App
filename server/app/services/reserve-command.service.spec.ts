import { expect, assert } from 'chai';
import { ReserveCommandService } from './reserve-command.service';
import { ReserveService } from './reserve.service';

describe('ReserveCommandService', () => {
    let service: ReserveCommandService;
    let reserveService: ReserveService;
    const numberOfAinReserve = 9;
    const numberOfBinReserve = 8;
    const numberOfCinReserve = 10;
    const numberOfWhiteInReserve = 1;
    beforeEach(() => {
        reserveService = new ReserveService();
        service = new ReserveCommandService(reserveService);
        service.reserveLetters = new Map<string, number>([
            ['B', numberOfBinReserve],
            ['*', numberOfWhiteInReserve],
            ['A', numberOfAinReserve],
            ['C', numberOfCinReserve],
        ]);
    });
    it('should be created', () => {
        assert.isDefined(service);
    });

    it('reserveStateCommand should print the letters in the reserve with their quantity', () => {
        const expectedReserveState = 'A: 9\nB: 8\nC: 10\n*: 1';
        const reserveState = service.reserveStateCommand().name;
        expect(reserveState).to.eql(expectedReserveState);
    });

    it('quantityOfWhiteLetters should return the quantity of white letters in the reserve', () => {
        const expectedWhiteLetterQuantity = 1;
        const whiteLetterQuantity = service.quantityOfWhiteLetters();
        expect(whiteLetterQuantity).to.eql(expectedWhiteLetterQuantity);
    });
});
