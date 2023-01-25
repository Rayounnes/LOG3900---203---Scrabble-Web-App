import { assert, expect } from 'chai';
import { Player } from './player';
import { ReserveService } from '@app/services/reserve.service';
import { Board } from './board';
import { ValidationCountingWordsService } from '@app/services/counting-validating-points.service';
describe('Player tests', () => {
    let player: Player;
    let reserve: ReserveService;
    let board: Board;
    let validationCountService: ValidationCountingWordsService;
    let fileName: string;
    beforeEach(() => {
        reserve = new ReserveService();
        board = new Board();
        fileName = 'dictionnary.json';
        validationCountService = new ValidationCountingWordsService(board, fileName);
        player = new Player(reserve, board, validationCountService);
    });
    it('player is created', () => {
        assert.isDefined(player);
    });
    it(' lettersLeft are set to 7 when player created', () => {
        const MAX_RACK_LETTERS = 7;
        expect(player.lettersLeft).to.eql(MAX_RACK_LETTERS);
    });
    it('lettersRack is created with 7 letters', () => {
        const MAX_RACK_LETTERS = 7;
        expect(player.lettersRack.lettersRack.length).to.eql(MAX_RACK_LETTERS);
    });
});
