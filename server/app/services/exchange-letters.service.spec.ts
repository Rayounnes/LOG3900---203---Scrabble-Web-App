/* eslint-disable dot-notation */
// acceder aux membres privés de la classe
import { expect, assert } from 'chai';
import { ExchangeLettersService } from './exchange-letters.service';
import { ReserveService } from './reserve.service';
import { ChevaletService } from './chevalet.service';

describe('ExchangeLettersService', () => {
    let service: ExchangeLettersService;
    let reserveService: ReserveService;
    let chevaletService: ChevaletService;
    beforeEach(() => {
        reserveService = new ReserveService();
        chevaletService = new ChevaletService(reserveService);
        service = new ExchangeLettersService(reserveService);
    });
    it('should be created', () => {
        assert.isDefined(service);
    });

    it('exchangeLettersCommand should return the right error message if there is not enough letters in the reserve', () => {
        reserveService.letterReserveSize = 6;
        const errorMessage = service.exchangeLettersCommand(chevaletService, ['a']).name;
        const expectedErrorMessage = 'Commande impossible a réaliser : le nombre de lettres dans la réserve est insuffisant';
        expect(errorMessage).to.eql(expectedErrorMessage);
    });

    it('exchangeLettersCommand should return the right error message if the number of letters to exchange is greater than 7', () => {
        reserveService.letterReserveSize = 102;
        const errorMessage = service.exchangeLettersCommand(chevaletService, ['a', 'b', 'f', 'e', 'r', 's', '*', 't', 'k']).name;
        const expectedErrorMessage = 'Erreur Syntaxe : commande invalide, nombre de lettres à échanger non conforme';
        expect(errorMessage).to.eql(expectedErrorMessage);
    });

    it('exchangeLettersCommand should return the right error message if one of the letters is written in uppercase', () => {
        reserveService.letterReserveSize = 102;
        const errorMessage = service.exchangeLettersCommand(chevaletService, ['a', 'B', 'e']).name;
        const expectedErrorMessage = 'Erreur Syntaxe : nom de commande invalide, lettre majuscule détectée';
        expect(errorMessage).to.eql(expectedErrorMessage);
    });

    it("exchangeLettersCommand should return the right error message if the player tries to exchange letters that he doesn't have", () => {
        reserveService.letterReserveSize = 102;
        const rackLetters: string[] = ['a', 'e', 'b', 'h', 'r', 'l', '*'];
        chevaletService['chevalet'] = rackLetters;
        const errorMessage = service.exchangeLettersCommand(chevaletService, ['j', '*', 'h']).name;
        const expectedErrorMessage = "Erreur Syntaxe : vous ne pouvez pas échanger une lettre que vous n'avez pas";
        expect(errorMessage).to.eql(expectedErrorMessage);
    });

    it('exchangeLettersCommand should return the right error message if the player tries to exchange the letters ae*', () => {
        reserveService.letterReserveSize = 102;
        const rackLetters: string[] = ['a', 'e', 'b', 'h', 'r', 'l', '*'];
        chevaletService['chevalet'] = rackLetters;
        const errorMessage = service.exchangeLettersCommand(chevaletService, ['a', 'e', '*']).name;
        const expectedErrorMessage = '!échanger ae*';
        expect(errorMessage).to.eql(expectedErrorMessage);
    });

    it('exchangeLettersCommand should replace letters e,r,* on the letter rack', () => {
        reserveService.letterReserveSize = 8;
        const rackLetters: string[] = ['i', 'e', 'b', 'h', 'r', 'l', '*'];
        chevaletService['chevalet'] = rackLetters;
        const numberOfAinReserve = 9;
        reserveService.reserve = new Map<string, number>([['A', numberOfAinReserve]]);
        const expectedChevalet: string[] = ['i', 'a', 'b', 'h', 'a', 'l', 'a'];
        service.exchangeLettersCommand(chevaletService, ['e', 'r', '*']);
        expect(chevaletService['chevalet']).to.eql(expectedChevalet);
    });
});
