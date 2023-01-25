/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable import/no-deprecated */
/* eslint-disable dot-notation */
// acceder aux membres privés de la classe
import { assert, expect } from 'chai';
import { ScrabbleClassic } from './scrabble-classic';
import * as sinon from 'sinon';
import { Board } from './board';
import { Letter } from '@app/interfaces/lettre';
import { Goal } from '@app/classes/goal';
import { ChevaletService } from '@app/services/chevalet.service';
import { HintWordsService } from '@app/services/hint-words.service';
import { ValidationCountingWordsService } from '@app/services/counting-validating-points.service';
import { ExchangeLettersService } from '@app/services/exchange-letters.service';
import { SocketUser } from '@app/interfaces/socket-user';
import { ScrabbleClassicSolo } from './scrabble-classic-solo';
import { LEVEL } from '@app/constants/constants';
import { SoloGame } from '@app/interfaces/solo-game';
import { ScrabbleLog2990 } from '@app/services/scrabble-log2990.service';
import { Dictionary } from '@app/interfaces/dictionary';

describe('Scrabble Classic', () => {
    let game: ScrabbleClassic;
    let firstSocket: string;
    let secondSocket: string;
    let fileName: string;
    beforeEach(async () => {
        firstSocket = 'testSocket1';
        secondSocket = 'testSocket2';
        fileName = 'dictionnary.json';
        game = new ScrabbleClassic(firstSocket, secondSocket, fileName, false);
    });

    it('getBox is created', () => {
        assert.isDefined(game);
    });

    it('toggleTurn should toggle the turn for the other player', () => {
        const turn = game.socketTurn;
        game.toggleTurn();
        expect(turn).to.not.eql(game.socketTurn);
    });

    it(' verifyPlaceCommand should return specific message when lettters not In Rack', () => {
        const stub = sinon.stub(ChevaletService.prototype, 'areLettersInRack').returns(false);
        const line = 2;
        const column = 5;
        const result = game.verifyPlaceCommand(line, column, 'tst', 'h');
        expect(result).to.eql('Erreur de syntaxe : les lettres écrites dans la commande ne sont pas dans votre chevalet');
        stub.restore();
    });
    it(' verifyPlaceCommand should call return specific message when first turn and one lettter not In H8', () => {
        const stubChevalet = sinon.stub(ChevaletService.prototype, 'areLettersInRack').returns(true);
        const stubBoard = sinon.stub(Board.prototype, 'areLettersInCenterOfBoard').returns(false);
        const line = 2;
        const column = 5;
        const result = game.verifyPlaceCommand(line, column, 'tst', 'h');
        expect(result).to.eql(
            'Commande impossible a réaliser : ce placement de lettres sort du plateau ou ne posséde pas une lettre dans la case H8',
        );
        stubChevalet.restore();
        stubBoard.restore();
    });
    it(' verifyPlaceCommand should call return specific message when letters not attached or outside', () => {
        const stubChevalet = sinon.stub(ChevaletService.prototype, 'areLettersInRack').returns(true);
        const stubBoard = sinon.stub(Board.prototype, 'areLettersAttachedAndNotOutside').returns(false);
        game['firstTurn'] = false;
        const line = 2;
        const column = 5;
        const result = game.verifyPlaceCommand(line, column, 'tst', 'h');
        expect(result).to.eql("Commande impossible a réaliser : ce placement de lettres sort du plateau ou n'est pas attaché a des lettres");
        stubChevalet.restore();
        stubBoard.restore();
    });
    it(' verifyPlaceCommand should call isFirstLetterOnALetter return specific message when first is in a position already taken', () => {
        const stubChevalet = sinon.stub(ChevaletService.prototype, 'areLettersInRack').returns(true);
        const stubBoard = sinon.stub(Board.prototype, 'isFirstLetterOnALetter').returns(true);
        game['firstTurn'] = false;
        const line = 2;
        const column = 5;
        const result = game.verifyPlaceCommand(line, column, 'tst', 'h');
        expect(result).to.eql('Commande impossible a réaliser : la position initiale choisi contient deja une lettre');
        stubChevalet.restore();
        stubBoard.restore();
    });
    it(' verifyPlaceCommand should return letters positions when valid positions', () => {
        const stubChevalet = sinon.stub(ChevaletService.prototype, 'areLettersInRack').returns(true);
        const stubBoard = sinon.stub(Board.prototype, 'areLettersAttachedAndNotOutside').returns(true);
        game['firstTurn'] = false;
        const line = 2;
        const column = 5;
        const result = game.verifyPlaceCommand(line, column, 't', 'h');
        expect(result).to.eql([{ line: 2, column: 5, value: 't' }]);
        stubChevalet.restore();
        stubBoard.restore();
    });
    it(' validateCalculateWordsPoints should return 0 and not call removeLettersOnRack when validation false', () => {
        const stubChevalet = sinon.stub(ValidationCountingWordsService.prototype, 'verifyAndCalculateWords').returns(0);
        const stubRack = sinon.spy(ChevaletService.prototype, 'removeLettersOnRack');
        const result = game.validateCalculateWordsPoints([{ line: 2, column: 5, value: 't' }]);
        expect(result).to.eql(0);
        assert(stubRack.notCalled);
        stubChevalet.restore();
        stubRack.restore();
    });
    it(' validateCalculateWordsPoints should return points and call removeLettersOnRack when validation true', () => {
        const points = 15;
        const stubChevalet = sinon.stub(ValidationCountingWordsService.prototype, 'verifyAndCalculateWords').returns(points);
        const stubRack = sinon.spy(ChevaletService.prototype, 'removeLettersOnRack');
        game['firstTurn'] = false;
        const result = game.validateCalculateWordsPoints([{ line: 2, column: 5, value: 't' }]);
        expect(result).to.eql(points);
        assert(stubRack.called);
        stubChevalet.restore();
        stubRack.restore();
    });
    it(' validateCalculateWordsPoints should call getGoalsPoints when validation true and mode is LOG2990', () => {
        const points = 15;
        const stubChevalet = sinon.stub(ValidationCountingWordsService.prototype, 'verifyAndCalculateWords').returns(points);
        const stubObjectifs = sinon.stub(game, 'getGoalsPoints').returns(points);
        game['firstTurn'] = false;
        game['isModeLog'] = true;
        const result = game.validateCalculateWordsPoints([{ line: 2, column: 5, value: 't' }]);
        expect(result).to.eql(points * 2);
        stubChevalet.restore();
        stubObjectifs.restore();
    });
    it(' getGoalsPoints should call addGoalsPoints from validationCountWords', () => {
        const points = 15;
        const stubChevalet = sinon.stub(ValidationCountingWordsService.prototype, 'addGoalsPoints').returns(points);
        game['firstTurn'] = false;
        game['isModeLog'] = true;
        game.getGoalsPoints([{ line: 2, column: 5, value: 't' }]);
        assert(stubChevalet.called);
        stubChevalet.restore();
    });
    it(' getExchangeCounter should return the exchange counter value', () => {
        const count = 5;
        game['modeLog']['cptExchange'] = count;
        game['isModeLog'] = true;
        const result = game.getExchangeCounter();
        expect(result).to.eql(count);
    });
    it(' getPrivateGoal should return the right goal', () => {
        const goal = { id: 1, name: 'goal 1', points: 40, isCompleted: false, isVerified: false, state: 'public' };
        const stubGoal = sinon.stub(game['counterPlayer'], 'get').returns(game['modeLog']);
        game['modeLog']['privateGoal'] = goal;
        game['isModeLog'] = true;
        const result = game.getPrivateGoal(firstSocket);
        expect(result).to.eql(goal);
        stubGoal.restore();
    });
    it(' changeExchangeCounter should call resetExchange', () => {
        const stubReset = sinon.stub(ScrabbleLog2990.prototype, 'resetExchange');
        game['isModeLog'] = true;
        game.changeExchangeCounter();
        assert(stubReset.called);
        stubReset.restore();
    });
    it(' getPlayerRack should return a list of letters', () => {
        const rackLetters: string[] = ['a', 'a', 't', 'e', 's', 't', 'z'];
        const stubRack = sinon.stub(game, 'getPlayerRack').returns(rackLetters);
        const rack = game.getPlayerRack(firstSocket);
        expect(rack).to.eql(rackLetters);
        stubRack.restore();
    });
    it(' removeLettersRackForValidation should return a new list without letters to remove', () => {
        const lettersToRemove: Letter[] = [
            { line: 0, column: 0, value: 'a' },
            { line: 0, column: 0, value: 't' },
            { line: 0, column: 0, value: 'z' },
        ];
        const rackLetters: string[] = ['a', 'a', 't', 'e', 's', 't', 'z'];
        const expectedRackLetters: string[] = ['', 'a', '', 'e', 's', 't', ''];
        const stubRack = sinon.stub(game, 'getPlayerRack').returns(rackLetters);
        const rack = game.removeLettersRackForValidation(firstSocket, lettersToRemove);
        expect(rack).to.eql(expectedRackLetters);
        stubRack.restore();
    });
    it(' removeLettersRackForValidation should return a new list without letters to remove even when letter is white letter', () => {
        const lettersToRemove: Letter[] = [
            { line: 0, column: 0, value: 'A' },
            { line: 0, column: 0, value: 't' },
            { line: 0, column: 0, value: 'Z' },
        ];
        const rackLetters: string[] = ['a', '*', 't', 'e', 's', 't', '*'];
        const expectedRackLetters: string[] = ['a', '', '', 'e', 's', 't', ''];
        const stubRack = sinon.stub(game, 'getPlayerRack').returns(rackLetters);
        const rack = game.removeLettersRackForValidation(firstSocket, lettersToRemove);
        expect(rack).to.eql(expectedRackLetters);
        stubRack.restore();
    });
    it(' exchangeLetters should call exchangeLettersCommand and dont break pass streak if exchange failed', () => {
        const lettersToRemove = 'test';
        game['passStreak'] = 4;
        const oldPassStreak = game['passStreak'];
        const stubExchanche = sinon.stub(ExchangeLettersService.prototype, 'exchangeLettersCommand').returns({
            name: 'Commande impossible a réaliser : le nombre de lettres dans la réserve est insuffisant',
            type: 'system',
            display: 'local',
        });
        game.exchangeLetters(lettersToRemove);
        const newPassStreak = game['passStreak'];
        expect(newPassStreak).to.eql(oldPassStreak);
        stubExchanche.restore();
    });
    it(' exchangeLetters should put pass streak at 0 and called changeExchangeCounter if exchange success', () => {
        const lettersToRemove = 'test';
        const stubCounter = sinon.stub(game, 'changeExchangeCounter');
        game['passStreak'] = 4;
        const stubExchanche = sinon.stub(ExchangeLettersService.prototype, 'exchangeLettersCommand').returns({
            name: '!échanger',
            type: 'game',
            display: 'local',
        });
        game.exchangeLetters(lettersToRemove);
        const newPassStreak = game['passStreak'];
        expect(newPassStreak).to.eql(0);
        assert(stubCounter.called);
        stubCounter.restore();
        stubExchanche.restore();
    });
    it(' gameEnded should return true when passStreak is 6 and calculate Rack Points', () => {
        const PASS_MAX_STREAK = 6;
        game['passStreak'] = PASS_MAX_STREAK;
        const spyRack = sinon.spy(ChevaletService.prototype, 'calculateRackPoints');
        const isGameEndend: boolean = game.gameEnded();
        expect(isGameEndend).to.eql(true);
        assert(spyRack.called);
    });
    it(' gameEnded should return true when reserve is empty and  rack is empty too', () => {
        const stubRack = sinon.stub(ChevaletService.prototype, 'isRackEmpty').returns(true);
        game['reserveLetters']['letterReserveSize'] = 0;
        const isGameEndend: boolean = game.gameEnded();
        expect(isGameEndend).to.eql(true);
        stubRack.restore();
    });
    it(' getPlayerRack should call lettersRack of ChevaletService', () => {
        const spyRack = sinon.spy(ChevaletService.prototype, 'lettersRack', ['get']);
        game.getPlayerRack(firstSocket);
        assert(spyRack.get.calledOnce);
    });
    it(' getPlayerTilesLeft should call rackInString of ChevaletService', () => {
        const spyRack = sinon.spy(ChevaletService.prototype, 'rackInString', ['get']);
        game.getPlayerTilesLeft(firstSocket);
        assert(spyRack.get.calledOnce);
    });
    it(' gameEndedMessage should return the right message', () => {
        const rackLettersPlayer1: string = game.getPlayerRack(firstSocket).join('');
        const rackLettersPlayer2: string = game.getPlayerRack(secondSocket).join('');
        const endMessage = [firstSocket, rackLettersPlayer1, secondSocket, rackLettersPlayer2];
        const message = game.gameEndedMessage();
        expect(message).to.eql(endMessage);
    });
    it(' getPlayerHintWords should call hintPlacement', () => {
        const stubHint = sinon.stub(HintWordsService.prototype, 'hintPlacement').returns('');
        game.getPlayerHintWords(firstSocket);
        assert(stubHint.called);
        stubHint.restore();
    });
    it('reserveState should call reserveStateCommand', () => {
        const expectedReserveCommandType = 'help';
        const reserveCommandType = game.reserveState().type;
        expect(reserveCommandType).to.eql(expectedReserveCommandType);
    });
    it('commandInfo should call helpCommand', () => {
        const expectedHelpCommandType = 'help';
        const helpCommandType = game.commandInfo().type;
        expect(helpCommandType).to.eql(expectedHelpCommandType);
    });
    it('changeSocket should delete the old socket and change the player key to the new socket', () => {
        const disconnectUser: SocketUser = { oldSocketId: firstSocket, newSocketId: 'test' };
        const player = game['gamePlayers'].get(disconnectUser.oldSocketId);
        game.changeSocket(disconnectUser);
        expect(game['gamePlayers'].get(disconnectUser.newSocketId)).to.eql(player);
        expect(typeof game['gamePlayers'].get(disconnectUser.oldSocketId)).to.eql('undefined');
    });
    it(' boardLetters should call allPlacedLetters', () => {
        const letters: Letter[] = [{ line: 0, column: 0, value: 'Z' }];
        game['board'].placeLetters(letters);
        const stubBoard = sinon.spy(Board.prototype, 'allPlacedLetters', ['get']);
        const lettersBoard: Letter[] = game.boardLetters;
        assert(stubBoard.get.called);
        expect(lettersBoard).to.eql(letters);
    });
    it('getExchangeCounter should return counterExchange', () => {
        game['modeLog']['cptExchange'] = 4;
        const result = game.getExchangeCounter();
        expect(result).to.eql(4);
    });

    it('getReserveLettersLength should return letterReserveSize', () => {
        game['reserveLetters']['letterReserveSize'] = 20;
        const result = game.getReserveLettersLength();
        expect(result).to.eql(20);
    });

    it('getPublicGoals should return goals of the game', () => {
        const goalsOfGame: Goal[] = [{ id: 1, name: 'goal 1', points: 40, isCompleted: false, isVerified: false, state: 'public' }];
        game['modeLog']['goalsOfTheGame'] = goalsOfGame;
        const result = game.getPublicGoals();
        expect(result).to.eql(goalsOfGame);
    });
    it(' transformToSoloGame should return the solo game modified', () => {
        const soloMatch: SoloGame = {
            usernameOne: 'Test',
            time: 30,
            mode: 'solo',
            dictionary: { fileName: 'dictionnary.json' } as Dictionary,
            difficulty: LEVEL.Beginner,
            room: 'room1',
            virtualPlayerName: 'Marc',
            isFinished: false,
            hostID: firstSocket,
        } as SoloGame;
        const soloGame = new ScrabbleClassicSolo(firstSocket, 'Marc', 'dictionnary.json', LEVEL.Beginner, false);
        const letters: Letter[] = [
            { line: 0, column: 0, value: 'Z' },
            { line: 0, column: 1, value: 'X' },
        ];
        const player1 = game['gamePlayers'].get(firstSocket);
        const player2 = game['gamePlayers'].get(secondSocket);
        game['board'].placeLetters(letters);
        game['passStreak'] = 4;
        game['firstTurn'] = false;
        game['turnSocket'] = secondSocket;
        const newGame = game.transformToSoloGame(soloGame, soloMatch);
        expect(newGame['board']).to.eql(game['board']);
        expect(newGame['passStreak']).to.eql(game['passStreak']);
        expect(newGame['firstTurn']).to.eql(game['firstTurn']);
        expect(newGame['turnSocket']).to.eql('Marc');
        expect(newGame['gamePlayers'].get(firstSocket)).to.eql(player1);
        expect(newGame['gamePlayers'].get('Marc')).to.eql(player2);
    });
});
