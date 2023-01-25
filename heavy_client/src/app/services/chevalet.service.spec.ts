/* eslint-disable max-lines */
// le chargé a dit que le max-lines des fichiers de tests n'importe pas
import { TestBed } from '@angular/core/testing';

import { ChevaletService } from './chevalet.service';
import * as chevalet from 'src/constants/chevalet-constants';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';

describe('ChevaletService', () => {
    let service: ChevaletService;
    let ctxStub: CanvasRenderingContext2D;
    let xpos: number;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        const chevaletConstants = new chevalet.ChevaletConstants();
        const CANVAS_WIDTH = chevaletConstants.width;
        const CANVAS_HEIGHT = chevaletConstants.height;
        service = new ChevaletService();
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.chevaletContext = ctxStub;
        xpos = 1;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getPosition should return the position of a letter in the rack', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        const letter = 'f';
        const expectedPosition = 5;
        expect(service.getPosition(letter)).toBe(expectedPosition);
    });
    it('getPosition should return the position of the * if the letter is uppercase()', () => {
        service.setLettersOfRack(['a', 'b', 'c', '*', 'e', 'f', 'g']);
        const letter = 'I';
        const expectedPosition = 3;
        expect(service.getPosition(letter)).toBe(expectedPosition);
    });
    it('getPosition should return undefined if the letter is not in the rack', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        const letter = 'h';
        const expectedOutput = undefined;
        expect(service.getPosition(letter)).toBe(expectedOutput);
    });
    it('removeLetterOnRack should make the letter out', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        const letter = 'a';
        service.rackArray[0].isOut = false;
        service.removeLetterOnRack(letter);
        expect(service.rackArray[0].isOut).toBeTruthy();
    });

    it('drawChevalet should call moveTo', () => {
        const moveToSpy = spyOn(service.chevaletContext, 'moveTo').and.callThrough();
        service.drawChevalet();
        expect(moveToSpy).toHaveBeenCalled();
    });

    it('drawChevalet should call LineTo', () => {
        const lineToSpy = spyOn(service.chevaletContext, 'lineTo').and.callThrough();
        service.drawChevalet();
        expect(lineToSpy).toHaveBeenCalled();
    });

    it('the rack have the right color', () => {
        const color = '#dbb773';
        service.fillChevalet();
        expect(service.chevaletContext.fillStyle).toBe(color);
    });

    it('writeOneLetterOnRack should call fillText', () => {
        const fillTextSpy = spyOn(service.chevaletContext, 'fillText').and.callThrough();
        service.writeOneLetterOnRack('A', xpos);
        expect(fillTextSpy).toHaveBeenCalled();
    });

    it('the letters have the right color', () => {
        const color = '#000000';
        service.writeOneLetterOnRack('A', xpos);
        expect(service.chevaletContext.fillStyle).toBe(color);
    });

    it('the function updateRack should call fillChevalet', () => {
        const fillChevaletSpy = spyOn(service, 'fillChevalet').and.callThrough();
        service.updateRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        expect(fillChevaletSpy).toHaveBeenCalled();
    });

    it('the function updateRack should call writeLettersOnRack', () => {
        const writeLettersOnRackSpy = spyOn(service, 'writeLettersOnRack').and.callThrough();
        service.updateRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        expect(writeLettersOnRackSpy).toHaveBeenCalled();
    });

    it('the function writePoint should call fillText', () => {
        const fillTextSpy = spyOn(service.chevaletContext, 'fillText').and.callThrough();
        service.writePoint('*', 1);
        expect(fillTextSpy).toHaveBeenCalled();
    });

    it('the function writeLettersOnRack should call writePoint 7 times', () => {
        const expectedCallTimes = 7;
        const writePointSpy = spyOn(service, 'writePoint').and.callThrough();
        service.writeLettersOnRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        expect(writePointSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it('the function writeLettersOnRack should call writePoint 0 times if all letters are undefined', () => {
        const expectedCallTimes = 0;
        const writePointSpy = spyOn(service, 'writePoint').and.callThrough();
        service.writeLettersOnRack([]);
        expect(writePointSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it('the function writeLettersOnRack should call writeOneLetterOnRack 0 times if all letters are undefined', () => {
        const expectedCallTimes = 0;
        const writeOneLetterOnRackSpy = spyOn(service, 'writeOneLetterOnRack').and.callThrough();
        service.writeLettersOnRack([]);
        expect(writeOneLetterOnRackSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it('the function writeOneLetterOnRack should be called 7 times at the beginning', () => {
        const expectedCallTimes = 7;
        const writeOneLetterOnRackSpy = spyOn(service, 'writeOneLetterOnRack').and.callThrough();
        service.writeLettersOnRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        expect(writeOneLetterOnRackSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it('the function writeLettersOnRack should not called the function writeOneLetterOnRack if there is no letter', () => {
        const letters = ['', '', '', ''];
        const writeOneLetterOnRackSpy = spyOn(service, 'writeOneLetterOnRack').and.callThrough();
        service.writeLettersOnRack(letters);
        expect(writeOneLetterOnRackSpy).not.toHaveBeenCalled();
    });

    it('writePoint return undefined when the letter is ""', () => {
        const valueExpected = undefined;
        const valueReturned = service.writePoint('', 1);
        expect(valueReturned).toBe(valueExpected);
    });

    it('verifyLetterOnRack should return true if the letter is in the rack', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        const letter = 'a';
        expect(service.verifyLetterOnRack(letter)).toBeTruthy();
    });

    it('verifyLetterOnRack should return false if the letter is not in the rack', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        const letter = 'j';
        expect(service.verifyLetterOnRack(letter)).toBeFalsy();
    });

    it('findPosition should return the x position', () => {
        const position = 300;
        const expectedPosition = 4;
        expect(service.findPosition(position)).toBe(expectedPosition);
    });
    it('fillTheTile should fill the tile with the right color', () => {
        const position = 300;
        const color = 'beige';
        const expectedColor = '#f5f5dc';
        service.fillTheTile(position, color);
        expect(service.chevaletContext.fillStyle).toBe(expectedColor);
    });
    it('deselectAllLetters should deselect all letters that have been selected', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        const exchangeSelection = 'echanger';
        service.rackArray[0].selection = exchangeSelection;
        service.rackArray[1].selection = exchangeSelection;
        const emptySelection = '';
        service.deselectAllLetters();

        expect(service.rackArray[0].selection).toBe(emptySelection);
        expect(service.rackArray[1].selection).toBe(emptySelection);
    });
    it('deselectLetter should deselect the letter that have been selected', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        const exchangeSelection = 'echanger';
        const position = 5;
        service.rackArray[position].selection = exchangeSelection;
        service.deselectLetter(position);
        const emptySelection = '';
        expect(service.rackArray[5].selection).toBe(emptySelection);
    });
    it('selectLetter should select the letter that have been selected for exchange', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        const exchangeSelection = 'echanger';
        service.selectLetter(0, exchangeSelection);

        expect(service.rackArray[0].selection).toBe(exchangeSelection);
    });
    it('selectLetter should select the letter that have been selected for manipulate', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        const manipulateSelection = 'manipuler';
        service.selectLetter(0, manipulateSelection);

        expect(service.rackArray[0].selection).toBe(manipulateSelection);
    });

    it('deselectManipulateLetter should deselect the letter that have been selected for manipulate', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        const manipulateSelection = 'manipuler';
        service.selectLetter(1, manipulateSelection);
        service.deselectManipulateLetter();
        expect(service.rackArray[1].selection).toBe('');
    });

    it('changeRackTile with a rightClick should select the letter that have been selected for exchange', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        const evt = new MouseEvent('contextMenu', {
            bubbles: true,
            cancelable: true,
            view: window,
            button: 2,
        });
        const exchangeSelection = 'echanger';
        service.changeRackTile(evt);

        expect(service.rackArray[0].selection).toBe(exchangeSelection);
    });
    it('changeRackTile with a leftClick should select the letter that have been selected for manipulate', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        const evt = new MouseEvent('contextMenu', {
            bubbles: true,
            cancelable: true,
            view: window,
            button: 0,
        });
        const manipulateSelection = 'manipuler';
        service.changeRackTile(evt);

        expect(service.rackArray[0].selection).toBe(manipulateSelection);
    });
    it('changeRackTile with a rightClick on a selected tile should select the letter that have been selected for exchange', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        const evt = new MouseEvent('contextMenu', {
            bubbles: true,
            cancelable: true,
            view: window,
            button: 2,
        });
        service.rackArray[0].selection = 'echanger';
        const emptySelection = '';
        service.changeRackTile(evt);

        expect(service.rackArray[0].selection).toBe(emptySelection);
    });
    it('changeRackTile with a click that is not right or left should do nothing', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        const evt = new MouseEvent('contextMenu', {
            bubbles: true,
            cancelable: true,
            view: window,
            button: 3,
        });
        const emptySelection = '';
        service.changeRackTile(evt);

        expect(service.rackArray[0].selection).toBe(emptySelection);
    });
    it('validationReserve should return true if the reserveLength is less than 7', () => {
        const reserveLength = 3;
        expect(service.validationReserve(reserveLength)).toBeTruthy();
    });
    it('validationReserve should return false if the reserveLength is greater than 7', () => {
        const reserveLength = 20;
        expect(service.validationReserve(reserveLength)).toBeFalsy();
    });

    it('lettersToExchange should return a string with the letters to exchange', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        service.rackArray[0].selection = 'echanger';
        service.rackArray[2].selection = 'echanger';
        service.rackArray[3].selection = 'echanger';
        service.rackArray[5].selection = 'echanger';
        const lettersofExchange = 'acdf';
        expect(service.lettersToExchange()).toBe(lettersofExchange);
    });
    it('putBackLetter should call reDrawLetter with if the letter is out of the rack', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        service.rackArray[0].isOut = true;
        const spy = spyOn(service, 'reDrawLetter');
        service.putBackLetter('a');
        expect(spy).toHaveBeenCalled();
    });
    it('putBackLetter should not call reDrawLetter with if the letter is not out of the rack', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        service.rackArray[0].isOut = false;
        const spy = spyOn(service, 'reDrawLetter');
        service.putBackLetter('a');
        expect(spy).not.toHaveBeenCalled();
    });
    it('putBackLetter should  call reDrawLetter with if the letter is uppercase and the * is Out of the rack', () => {
        service.setLettersOfRack(['a', 'b', 'c', '*', 'e', 'f', 'g']);
        service.rackArray[3].isOut = true;
        const spy = spyOn(service, 'reDrawLetter');
        service.putBackLetter('H');
        expect(spy).toHaveBeenCalled();
    });
    it('reDrawLetter should make to isOut to false', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        service.rackArray[0].isOut = true;
        service.reDrawLetter(0);
        expect(service.rackArray[0].isOut).toBeFalsy();
    });
    it('findManipulateLetter should find the position of the selected letter for manipulate', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        service.rackArray[2].selection = 'manipuler';
        const position = service.findManipulateLetter();
        expect(position).toBe(2);
    });
    it('findManipulateLetter should find the position of the selected letter for manipulate', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        const position = service.findManipulateLetter();
        expect(position).toBe(undefined);
    });
    it('moveLetter should call moveLetterRight is there is a letter selected and the button pressed is ArrowRight', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        const spy = spyOn(service, 'moveLetterRight');
        service.rackArray[2].selection = 'manipuler';
        service.moveLetter('ArrowRight');
        expect(spy).toHaveBeenCalled();
    });
    it('moveLetter should call moveLetterLeft is there is a letter selected and the button pressed is ArrowLeft', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        const spy = spyOn(service, 'moveLetterLeft');
        service.rackArray[2].selection = 'manipuler';
        service.moveLetter('ArrowLeft');
        expect(spy).toHaveBeenCalled();
    });
    it('moveLetter should not call moveLetterRight or moveLetterLeft there is not a letter selected to manipulate', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        const spyLeft = spyOn(service, 'moveLetterLeft');
        const spyRight = spyOn(service, 'moveLetterRight');
        service.moveLetter('ArrowLeft');
        service.moveLetter('ArrowRight');
        expect(spyLeft).not.toHaveBeenCalled();
        expect(spyRight).not.toHaveBeenCalled();
    });
    it('moveLetterRight at the last letter of the rack should move the letter at the beginning', () => {
        const endRack = 6;
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        service.moveLetterRight(endRack);
        expect(service.rackArray[0].letter).toBe('g');
    });
    it('moveLetterRight at a letter of the rack should move the letter at the right', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        service.moveLetterRight(1);
        expect(service.rackArray[2].letter).toBe('b');
    });

    it('moveLetterLeft at the first letter of the rack should move the letter at the end', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        service.moveLetterLeft(0);
        expect(service.rackArray[6].letter).toBe('a');
    });
    it('moveLetterLeft at a letter of the rack should move the letter at the left', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        service.moveLetterLeft(1);
        expect(service.rackArray[0].letter).toBe('b');
    });
    it('selectLetterKeyboard should select a letter to manipulate', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        service.selectLetterKeyboard('c');
        expect(service.rackArray[2].selection).toBe('manipuler');
    });
    it('rackArrayLetters should return an array of the letters in the rack', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        const arrayRack = service.rackArrayLetters();
        expect(arrayRack).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
    });
    it('makerackTilesIn should make isOut of every letters to false', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        service.rackArray[0].isOut = true;
        service.rackArray[2].isOut = true;
        service.makerackTilesIn();
        expect(service.rackArray[0].isOut).toBeFalsy();
        expect(service.rackArray[2].isOut).toBeFalsy();
    });
    it('makeLetterOut should make the attribute isOut of the letter to true ', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        service.makeLetterOut('g');
        expect(service.rackArray[6].isOut).toBeTruthy();
    });

    it('makeLetterOut should make the attribute isOut of upper case letter to true ', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', '*']);
        service.makeLetterOut('G');
        expect(service.rackArray[6].isOut).toBeTruthy();
    });

    it('makeLetterOut should do nothing if the letter is not in the rack', () => {
        service.setLettersOfRack(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        service.makeLetterOut('h');
        expect(service.rackArray[6].isOut).toBeFalsy();
        expect(service.rackArray[5].isOut).toBeFalsy();
        expect(service.rackArray[4].isOut).toBeFalsy();
        expect(service.rackArray[3].isOut).toBeFalsy();
        expect(service.rackArray[2].isOut).toBeFalsy();
        expect(service.rackArray[1].isOut).toBeFalsy();
        expect(service.rackArray[0].isOut).toBeFalsy();
    });
});
