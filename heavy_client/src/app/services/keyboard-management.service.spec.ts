/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-len */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { Board } from '@app/classes/board';
import { RackTile } from '@app/classes/rack-tile';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Vec2 } from '@app/interfaces/vec2';
import { Socket } from 'socket.io-client';
import { ChatSocketClientService } from './chat-socket-client.service';
import { ChevaletService } from './chevalet.service';
import { KeyboardManagementService } from './keyboard-management.service';

describe('KeyboardManagementService', () => {
    let service: KeyboardManagementService;
    let rackArrayTest: RackTile[];
    let positionStartTest: Vec2;
    let board: Board;
    const rackTest: string[] = ['a', 'b', 'c', 'd', 'e', '*'];
    let chevaletServiceSpyObj: jasmine.SpyObj<ChevaletService>;

    beforeEach(() => {
        chevaletServiceSpyObj = jasmine.createSpyObj('ChevaletService', ['verifyLetterOnRack', 'makerackTilesIn', 'putBackLetter'], {
            rackArray: rackTest,
        });

        TestBed.configureTestingModule({
            providers: [{ provide: ChevaletService, useValue: chevaletServiceSpyObj }],
        });
        service = TestBed.inject(KeyboardManagementService);
        rackArrayTest = [
            { letter: 'a', selection: '' },
            { letter: 'b', selection: '' },
            { letter: 'c', selection: '' },
            { letter: 'd', selection: '' },
            { letter: 'e', selection: '' },
            { letter: '*', selection: '' },
        ];
        board = new Board();
        board.resetStartTile();
        board.setStartTile(2, 2);
        positionStartTest = { x: 2, y: 2 };
        service.gridService.board.boardMatrix[positionStartTest.x][positionStartTest.y].direction = 'h';
        service.temporaryRack = rackArrayTest;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should temporaryRack be equal to rackArray', () => {
        service.createTemporaryRack();
        expect(service.temporaryRack).toEqual(chevaletServiceSpyObj.rackArray);
    });

    it('should change positionStart if horizontal', () => {
        service.gridService.board.boardMatrix[positionStartTest.x][positionStartTest.y].direction = 'h';
        const positionStartFinal = { x: 2, y: 3 };
        const result = service.placeDependDirection(positionStartTest);
        expect(result).toEqual(positionStartFinal);
    });

    it('should change positionStart if vertical', () => {
        service.gridService.board.boardMatrix[positionStartTest.x][positionStartTest.y].direction = 'v';
        const positionStartFinal = { x: 3, y: 2 };
        const result = service.placeDependDirection(positionStartTest);
        expect(result).toEqual(positionStartFinal);
    });

    it('placeLetterOnGrid should call fillColor and writeLetter', () => {
        const fillColorSpy = spyOn<any>(service.gridService, 'fillColor').and.callFake(() => {
            return;
        });
        const writeLetterSpy = spyOn<any>(service.gridService, 'writeLetter').and.callFake(() => {
            return;
        });
        service.placeLetterOnGrid(positionStartTest, 'b');
        expect(fillColorSpy).toHaveBeenCalled();
        expect(writeLetterSpy).toHaveBeenCalled();
    });

    it('placeLetterOnGrid should call drawArrowHorizontal', () => {
        service.word = { line: 0, column: 0, orientation: 'h', value: '' };
        spyOn(service.gridService, 'drawGrid').and.stub();
        spyOn(service.gridService, 'fillColor').and.stub();
        spyOn(service.gridService, 'writeLetter').and.stub();
        spyOn(service.gridService, 'drawDependColor').and.stub();
        const drawArrowHorizontalSpy = spyOn(service, 'drawArrowHorizontal').and.stub();
        service.placeLetterOnGrid({ x: 3, y: 3 }, 'b');
        expect(drawArrowHorizontalSpy).toHaveBeenCalled();
    });

    it('placeLetterOnGrid should call drawArrowVertical', () => {
        service.word = { line: 0, column: 0, orientation: 'v', value: '' };
        spyOn(service.gridService, 'drawGrid').and.stub();
        spyOn(service.gridService, 'fillColor').and.stub();
        spyOn(service.gridService, 'writeLetter').and.stub();
        spyOn(service.gridService, 'drawDependColor').and.stub();
        const drawArrowVerticalSpy = spyOn(service, 'drawArrowVertical').and.stub();
        service.placeLetterOnGrid({ x: 3, y: 3 }, 'b');
        expect(drawArrowVerticalSpy).toHaveBeenCalled();
    });

    it('placerLetterOnGrid increment position if getIsFilled is true', () => {
        service.word = { line: 0, column: 0, orientation: 'h', value: '' };
        const positionStart = { x: 1, y: 1 };
        spyOn(service.gridService, 'fillColor').and.stub();
        spyOn(service.gridService, 'writeLetter').and.stub();
        service.gridService.board.isTileFilled(2, 3);
        service.placeLetterOnGrid(positionStart, 'a');
        expect(positionStart.x).toEqual(2);
    });

    it('placerLetterOnGrid increment position if getIsFilled is true', () => {
        service.word = { line: 0, column: 0, orientation: 'v', value: '' };
        const positionStart = { x: 1, y: 1 };
        spyOn(service.gridService, 'fillColor').and.stub();
        spyOn(service.gridService, 'writeLetter').and.stub();
        service.gridService.board.isTileFilled(3, 2);
        service.placeLetterOnGrid(positionStart, 'a');
        expect(positionStart.y).toEqual(2);
    });

    it('removeArrowAfterPlacement increment position if getIsFilled is true', () => {
        const positionStart = { x: 1, y: 1 };
        spyOn(service.gridService, 'fillColor').and.stub();
        spyOn(service.gridService, 'writeLetter').and.stub();
        service.gridService.board.isTileFilled(2, 3);
        service.removeArrowAfterPlacement(positionStart, 'h');
        expect(positionStart.y).toEqual(2);
    });

    it('removeArrowAfterPlacement increment position if getIsFilled is true', () => {
        const positionStart = { x: 1, y: 1 };
        spyOn(service.gridService, 'fillColor').and.stub();
        spyOn(service.gridService, 'writeLetter').and.stub();
        service.gridService.board.isTileFilled(3, 2);
        service.removeArrowAfterPlacement(positionStart, 'v');
        expect(positionStart.x).toEqual(2);
    });

    it('incrementePosition should increment position.y if horizontal', () => {
        const positionStart = { x: 1, y: 1 };
        service.gridService.board.changeDirection(positionStart, 'h');
        const positionStartResult = service.incrementePosition(positionStart);
        expect(positionStartResult.y).toEqual(2);
    });

    it('incrementePosition should increment position.x if vertical', () => {
        const positionStart = { x: 1, y: 1 };
        service.gridService.board.changeDirection(positionStart, 'v');
        const positionStartResult = service.incrementePosition(positionStart);
        expect(positionStartResult.x).toEqual(2);
    });

    it('incrementePosition should not increment position if no orientation', () => {
        const positionStart = { x: 1, y: 1 };
        service.gridService.board.changeDirection(positionStart, '');
        const positionStartResult = service.incrementePosition(positionStart);
        expect(positionStartResult).toEqual(positionStart);
    });

    it('placerOneLetter should call placeLetterOnGrid function', () => {
        const positionStart = { x: 1, y: 1 };
        service.gridService.board.setStartTile(positionStart.x, positionStart.y);
        spyOn(service, 'conditionToPlay').and.returnValue(true);
        spyOn(service, 'initializeWordArg').and.stub();
        const placeLetterOnGridSpy = spyOn(service, 'placeLetterOnGrid').and.stub();
        service.placerOneLetter('a');
        expect(placeLetterOnGridSpy).toHaveBeenCalled();
    });

    it('placerOneLetter should call initializeWordArgs function', () => {
        const initializeWrodArgSpy = spyOn(service, 'initializeWordArg').and.stub();
        service.placerOneLetter('a');
        expect(initializeWrodArgSpy).toHaveBeenCalled();
    });

    it('drawArrowHonrizontal should call drawRightArrow and fillTheTile', () => {
        const drawRightArrowSpy = spyOn<any>(service.mouseService, 'drawRightArrow').and.callFake(() => {
            return;
        });
        const fillTheTileSpy = spyOn<any>(service.mouseService, 'fillTheTile').and.callFake(() => {
            return;
        });
        service.drawArrowHorizontal(positionStartTest);
        expect(drawRightArrowSpy).toHaveBeenCalled();
        expect(fillTheTileSpy).toHaveBeenCalled();
    });

    it('drawArrowVertical should call drawDownArrow and fillTheTile', () => {
        const drawDownArrowSpy = spyOn<any>(service.mouseService, 'drawDownArrow').and.callFake(() => {
            return;
        });
        const fillTheTileSpy = spyOn<any>(service.mouseService, 'fillTheTile').and.callFake(() => {
            return;
        });
        service.drawArrowVertical(positionStartTest);
        expect(drawDownArrowSpy).toHaveBeenCalled();
        expect(fillTheTileSpy).toHaveBeenCalled();
    });

    it('removeArrowDependDirection should call removeArrowMark if horizontal', () => {
        const removeArrowMarkSpy = spyOn<any>(service, 'removeArrowMark').and.callFake(() => {
            return;
        });
        service.removeArrowDependDirection(positionStartTest, positionStartTest, 'h');
        expect(removeArrowMarkSpy).toHaveBeenCalled();
    });

    it('removeArrowDependDirection should call removeArrowMark if vertical', () => {
        const removeArrowMarkSpy = spyOn<any>(service, 'removeArrowMark').and.callFake(() => {
            return;
        });
        service.removeArrowDependDirection(positionStartTest, positionStartTest, 'v');
        expect(removeArrowMarkSpy).toHaveBeenCalled();
    });

    it('removeArrowMark should call fillColor and DrawDependColor', () => {
        const fillColorSpy = spyOn<any>(service.gridService, 'fillColor').and.callFake(() => {
            return;
        });
        const drawDependColorSpy = spyOn<any>(service.gridService, 'drawDependColor').and.callFake(() => {
            return;
        });
        service.removeArrowMark(positionStartTest, true);
        expect(fillColorSpy).toHaveBeenCalled();
        expect(drawDependColorSpy).toHaveBeenCalled();
    });

    it('importantKey should call removeLastLetter if key is Backspace', () => {
        const removeLastLetterSpy = spyOn<any>(service, 'removeLastLetter').and.callFake(() => {
            return;
        });
        service.importantKey('Backspace');
        expect(removeLastLetterSpy).toHaveBeenCalled();
    });

    it('importantKey should call removeAllLetters if key is Escape', () => {
        const removeAllLettersSpy = spyOn<any>(service, 'removeAllLetters').and.callFake(() => {
            return;
        });
        service.importantKey('Escape');
        expect(removeAllLettersSpy).toHaveBeenCalled();
    });

    it('importantKey should call playOrEnter if key is Enter', () => {
        const playOrEnterSpy = spyOn<any>(service, 'playOrEnter').and.callFake(() => {
            return;
        });
        service.importantKey('Enter');
        expect(playOrEnterSpy).toHaveBeenCalled();
    });

    it('removeAllLetters should call removeLastLetter', () => {
        service.letters = [{ line: 5, column: 6, value: 's' }];
        const removeLastLetterSpy = spyOn<any>(service, 'removeLastLetter').and.callFake(() => {
            service.letters.pop();
            return;
        });
        service.removeAllLetters();
        expect(removeLastLetterSpy).toHaveBeenCalled();
    });

    it('verificationLowerCase should return true if the letter is lowerCase', () => {
        const result = service.verificationLowerCase('b');
        expect(result).toEqual(true);
    });

    it('verificationLowerCase should return false if the letter is UpperCase', () => {
        const result = service.verificationLowerCase('B');
        expect(result).toEqual(false);
    });

    it('verificationUpperCase should return true if the letter is UpperCase', () => {
        const result = service.verificationUpperCase('B');
        expect(result).toEqual(true);
    });

    it('verificationUpperCase should return false if the letter is LowerCase', () => {
        const result = service.verificationUpperCase('b');
        expect(result).toEqual(false);
    });

    it('verificationAccentOnE should return e if the letter is é', () => {
        const result = service.verificationAccentOnE('é');
        expect(result).toEqual('e');
    });

    it('verificationAccentOnE should return the letter if the letter is not é', () => {
        const result = service.verificationAccentOnE('a');
        expect(result).toEqual('a');
    });

    it('outOfGrid should return false if the position is out the grid', () => {
        const positionStart = { x: 20, y: 4 };
        const result = service.outOfGrid(positionStart);
        expect(result).toEqual(false);
    });

    it('outOfGrid should return true if the position is not out the grid', () => {
        const positionStart = { x: 8, y: 4 };
        const result = service.outOfGrid(positionStart);
        expect(result).toEqual(true);
    });

    it('conditionDirections should return true if the position is in the grid and is filled', () => {
        service.gridService.board.isTileFilled(positionStartTest.y + 1, positionStartTest.x + 1);
        const result = service.conditionsDirections(positionStartTest);
        expect(result).toEqual(true);
    });

    it('conditionDirections should return false if tile is not filled', () => {
        service.gridService.board.isNotFilled(positionStartTest.y + 1, positionStartTest.x + 1);
        const result = service.conditionsDirections(positionStartTest);
        expect(result).toEqual(false);
    });

    it('initializeWordArgs should set the positionStart values in word', () => {
        service.initializeWordArg(positionStartTest);
        expect(service.word.line).toEqual(positionStartTest.y);
        expect(service.word.column).toEqual(positionStartTest.x);
    });

    it('verificationKeyBoard should return true if the letter is lowerCase', () => {
        const result = service.verificationKeyboard('y');
        expect(result).toEqual(true);
    });

    it('verificationKeyBoard should return true if the letter is UpperCase', () => {
        const result = service.verificationKeyboard('Y');
        expect(result).toEqual(true);
    });

    it('verificationKeyBoard should return false if the letter is not a letter', () => {
        const result = service.verificationKeyboard('/');
        expect(result).toEqual(false);
    });

    it('correctCorrection should return the opposite orientation', () => {
        service.gridService.board.boardMatrix[positionStartTest.x][positionStartTest.y].direction = 'h';
        const result = service.correctOrientation(positionStartTest);
        expect(result).toEqual('v');
    });

    it('correctCorrection should return the opposite orientation', () => {
        service.gridService.board.boardMatrix[positionStartTest.x][positionStartTest.y].direction = 'v';
        const result = service.correctOrientation(positionStartTest);
        expect(result).toEqual('h');
    });

    it('correctCorrection should return an empty string if there is no orientation', () => {
        service.gridService.board.changeDirection(positionStartTest, '');
        expect(service.correctOrientation(positionStartTest)).toEqual('');
    });

    it('isLetterAlreadyUsed should return true if the letter is in the temporaryRack', () => {
        const result1 = service.isLetterAlreadyUsed('a');
        expect(result1).toEqual(true);
        const result2 = service.isLetterAlreadyUsed('a');
        expect(result2).toEqual(false);
    });

    it('conditionOnRack should return true if the letter is in the rack', () => {
        chevaletServiceSpyObj.verifyLetterOnRack.and.returnValue(true);
        const result = service.conditionOnRack('a');
        expect(result).toEqual(true);
    });

    it('conditionOnRack should return false if the letter is not in the rack', () => {
        chevaletServiceSpyObj.verifyLetterOnRack.and.returnValue(false);
        const result = service.conditionOnRack('y');
        expect(result).toEqual(false);
    });

    it('conditionOnRack should return false if the * is not the rack', () => {
        chevaletServiceSpyObj.verifyLetterOnRack.and.returnValue(false);
        const result = service.conditionOnRack('A');
        expect(result).toEqual(false);
    });

    it('conditionToPlay should return true if the conditions are respected', () => {
        service.enterPressed = false;
        service.playPressed = false;
        chevaletServiceSpyObj.verifyLetterOnRack.and.returnValue(true);
        const result = service.conditionToPlay('b');
        expect(result).toEqual(true);
    });

    it('addInLettersArray should update the letters array', () => {
        service.addInLettersArray('a', positionStartTest);
        expect(service.letters[0].value).toEqual('a');
        expect(service.letters[0].line).toEqual(positionStartTest.y);
        expect(service.letters[0].column).toEqual(positionStartTest.x);
    });

    it('addInLettersArray should set * if the letter is upperCase', () => {
        service.addInLettersArray('A', positionStartTest);
        expect(service.letters[0].value).toEqual('*');
    });

    it('buttonPlayPressed should call the function playOrEnter', () => {
        const playOrEnterSpy = spyOn<any>(service, 'playOrEnter').and.callFake(() => {
            return;
        });
        service.buttonPlayPressed();
        expect(playOrEnterSpy).toHaveBeenCalled();
    });

    it('playOrEnter should call the function actionsAfterPlacement', () => {
        const socketHelper = new SocketTestHelper();
        const socketService = new ChatSocketClientService();
        socketService.socket = socketHelper as unknown as Socket;
        service.socketService = socketService;
        service.letters = [
            {
                line: 8,
                column: 8,
                value: '4',
            },
        ];

        const actionsAfterPlacementSpy = spyOn(service, 'actionsAfterPlacement');
        service.playOrEnter();
        expect(actionsAfterPlacementSpy).toHaveBeenCalled();
    });

    it('actionsAfterPlacement should create wordFormed and call removeArrowAfterPlacement', () => {
        service.word = { line: 4, column: 6, orientation: 'h', value: 'salut' };
        const removeArrowAfterPlacementSpy = spyOn<any>(service, 'removeArrowAfterPlacement').and.callFake(() => {
            return;
        });
        service.actionsAfterPlacement();
        expect(removeArrowAfterPlacementSpy).toHaveBeenCalled();
        expect(service.wordFormed).toEqual(service.word);
    });

    it('initializeBeforeTurn should call the function createTemporaryRack and initialize letters and word', () => {
        const wordInitialized = { line: 0, column: 0, orientation: '', value: '' };
        const createTemporaryRackSpy = spyOn<any>(service, 'createTemporaryRack').and.callFake(() => {
            return;
        });
        service.initializeBeforeTurn();
        expect(createTemporaryRackSpy).toHaveBeenCalled();
        expect(service.letters).toEqual([]);
        expect(service.word).toEqual(wordInitialized);
    });

    it('letterRemovedInRack put the letter in temporaryRack', () => {
        service.chevaletService.rackArray[0] = rackArrayTest[0];
        service.letterRemovedInRack({ line: 4, column: 5, value: 'a' });
        const letter = rackArrayTest[0].letter;
        expect(letter).toEqual(service.temporaryRack[0].letter);
    });

    it('letterRemovedInRack put the * in temporaryRack', () => {
        service.chevaletService.rackArray[5] = rackArrayTest[5];
        service.letterRemovedInRack({ line: 5, column: 5, value: 'B' });
        const letter = rackArrayTest[5].letter;
        expect(service.temporaryRack[5].letter).toEqual(letter);
    });

    it('putOldTile should call fillColor and DrawDependColor', () => {
        const fillColorSpy = spyOn<any>(service.gridService, 'fillColor').and.callFake(() => {
            return;
        });
        const drawDependColorSpy = spyOn<any>(service.gridService, 'drawDependColor').and.callFake(() => {
            return;
        });
        service.putOldTile(3, 4);
        expect(fillColorSpy).toHaveBeenCalled();
        expect(drawDependColorSpy).toHaveBeenCalled();
    });

    it('letterRemoved should call letterRemovedInRack and putOldTile', () => {
        const letterRemovedInRackSpy = spyOn<any>(service, 'letterRemovedInRack').and.callFake(() => {
            return;
        });
        const putOldTileSpy = spyOn<any>(service, 'putOldTile').and.callFake(() => {
            return;
        });
        service.letterRemoved({ line: 4, column: 4, value: 's' });
        expect(letterRemovedInRackSpy).toHaveBeenCalled();
        expect(putOldTileSpy).toHaveBeenCalled();
    });

    it('manageArrow should call removeArrowDependDirection and drawArrowHorizontal if word horizontal', () => {
        service.word = { line: 5, column: 4, orientation: 'h', value: 'salut' };
        const removeArrowDependDirectionSpy = spyOn<any>(service, 'removeArrowDependDirection').and.callFake(() => {
            return;
        });
        const drawArrowHorizontalSpy = spyOn<any>(service, 'drawArrowHorizontal').and.callFake(() => {
            return;
        });
        service.manageArrow(5, 4);
        expect(removeArrowDependDirectionSpy).toHaveBeenCalled();
        expect(drawArrowHorizontalSpy).toHaveBeenCalled();
    });

    it('manageArrow should call removeArrowDependDirection and drawArrowVertical if word vertical', () => {
        service.word = { line: 5, column: 4, orientation: 'v', value: 'salut' };
        const removeArrowDependDirectionSpy = spyOn<any>(service, 'removeArrowDependDirection').and.callFake(() => {
            return;
        });
        const drawArrowVerticalSpy = spyOn<any>(service, 'drawArrowVertical').and.callFake(() => {
            return;
        });
        service.manageArrow(5, 4);
        expect(removeArrowDependDirectionSpy).toHaveBeenCalled();
        expect(drawArrowVerticalSpy).toHaveBeenCalled();
    });

    it('removeLastLetter should call letterRemoved, manageArrow and updateWord', () => {
        service.letters = [
            { line: 4, column: 5, value: 's' },
            { line: 4, column: 6, value: 'a' },
        ];
        const letterRemovedSpy = spyOn<any>(service, 'letterRemoved').and.callFake(() => {
            return;
        });
        const manageArrowSpy = spyOn<any>(service, 'manageArrow').and.callFake(() => {
            return;
        });
        const updateWordSpy = spyOn<any>(service, 'updateWord').and.callFake(() => {
            return;
        });
        const drawGridSpy = spyOn(service.gridService, 'drawGrid').and.stub();
        spyOn(service.gridService, 'fillColor').and.stub();
        spyOn(service.gridService, 'writeLetter').and.stub();
        spyOn(service.gridService, 'drawDependColor').and.stub();
        spyOn(service, 'setWordStartedFalse').and.stub();
        service.removeLastLetter();
        expect(letterRemovedSpy).toHaveBeenCalled();
        expect(manageArrowSpy).toHaveBeenCalled();
        expect(updateWordSpy).toHaveBeenCalled();
        expect(drawGridSpy).toHaveBeenCalled();
    });

    it('updateWord should change letters array length', () => {
        service.letters = [
            { line: 4, column: 5, value: 's' },
            { line: 4, column: 6, value: 'a' },
        ];
        const size = 1;
        service.updateWord();
        expect(service.letters.length).toEqual(size);
    });

    it('setWordStartedFalse should set wordStarted to false', () => {
        service.gridService.board.wordStarted = true;
        service.setWordStartedFalse({ line: 5, column: 6, value: 's' }, { x: 6, y: 5 });
        expect(service.gridService.board.wordStarted).toEqual(false);
    });

    it('removeAfterPlacement should call removeArrow if horizontal', () => {
        const removeArrowSpy = spyOn<any>(service, 'removeArrow').and.callFake(() => {
            return;
        });
        service.removeArrowAfterPlacement({ x: 2, y: 2 }, 'h');
        expect(removeArrowSpy).toHaveBeenCalled();
    });

    it('removeAfterPlacement should call removeArrow if vertical', () => {
        const removeArrowSpy = spyOn<any>(service, 'removeArrow').and.callFake(() => {
            return;
        });
        service.removeArrowAfterPlacement({ x: 2, y: 2 }, 'v');
        expect(removeArrowSpy).toHaveBeenCalled();
    });

    it('removeArrowMark should call removeArrow if not vertical', () => {
        const removeArrowSpy = spyOn<any>(service, 'removeArrow').and.callFake(() => {
            return;
        });
        service.removeArrowMark({ x: 2, y: 2 }, false);
        expect(removeArrowSpy).toHaveBeenCalled();
    });
});
