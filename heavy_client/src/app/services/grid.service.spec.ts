/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
// import { toBase64String } from '@angular/compiler/src/output/source_map';
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { GridService } from '@app/services/grid.service';
import { Letter } from '@app/interfaces/letter';
import { Board } from '@app/classes/board';
import * as gridConstants from 'src/constants/grid-constants';

describe('GridService', () => {
    let service: GridService;
    let ctxStub: CanvasRenderingContext2D;
    let xpos: number;
    let ypos: number;
    let fontWord: string;
    let step: number;
    let wordSize: number;
    let letters: Letter[];
    const CANVAS_WIDTH = 635;
    const CANVAS_HEIGHT = 635;
    let board: Board;
    let grid: gridConstants.GridConstants;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GridService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.gridContext = ctxStub;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        xpos = 100;
        ypos = 100;
        fontWord = '40px system-ui';
        step = 13;
        wordSize = 13;
        letters = [
            { line: 1, column: 1, value: 'P' },
            { line: 1, column: 2, value: 'O' },
            { line: 1, column: 3, value: 'T' },
        ];
        board = new Board();
        grid = new gridConstants.GridConstants();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' width should return the width of the grid canvas', () => {
        expect(service.width).toEqual(CANVAS_WIDTH);
    });

    it(' height should return the height of the grid canvas', () => {
        expect(service.width).toEqual(CANVAS_HEIGHT);
    });
    // TEST DES FONCTIONS drawWord#COLOR LES CALLS
    it('DrawWordRed should call the function DrawWord', () => {
        const drawWordSpy = spyOn(service, 'drawWord').and.callThrough();
        service.drawWordRed(wordSize);
        expect(drawWordSpy).toHaveBeenCalled();
    });

    it('DrawWordDarkBlue should call the function DrawWord', () => {
        const drawWordSpy = spyOn(service, 'drawWord').and.callThrough();
        service.drawWordDarkBlue(wordSize);
        expect(drawWordSpy).toHaveBeenCalled();
    });

    it('DrawWordLightBlue should call the function DrawWord', () => {
        const drawWordSpy = spyOn(service, 'drawWord').and.callThrough();
        service.drawWordLightBlue(wordSize);
        expect(drawWordSpy).toHaveBeenCalled();
    });

    it('DrawWordPink should call the function DrawWord', () => {
        const drawWordSpy = spyOn(service, 'drawWord').and.callThrough();
        service.drawWordPink(wordSize);
        expect(drawWordSpy).toHaveBeenCalled();
    });

    it('DrawWordLightBlue should call the function DrawWordSpecificLightBlue', () => {
        const drawWordSpecificLightBlueSpy = spyOn(service, 'drawWordSpecificLightBlue').and.callThrough();
        service.drawWordLightBlue(wordSize);
        expect(drawWordSpecificLightBlueSpy).toHaveBeenCalled();
    });

    it('DrawWordLightBlue should call the function DrawWordSpecificLightBlue', () => {
        const drawWordSpecificLightBlueSpy = spyOn(service, 'drawWordSpecificLightBlue').and.callThrough();
        service.drawWordLightBlue(wordSize);
        expect(drawWordSpecificLightBlueSpy).toHaveBeenCalled();
    });

    it('fillLightBlue should call the function fillSpecificLightBlue', () => {
        const fillSpecificLightBlueSpy = spyOn(service, 'fillSpecificLightBlue').and.callThrough();
        service.fillLightBlue();
        expect(fillSpecificLightBlueSpy).toHaveBeenCalled();
    });

    it('buildBoard should call the function fillRed', () => {
        const fillRedSpy = spyOn(service, 'fillRed').and.callThrough();
        service.buildBoard(wordSize);
        expect(fillRedSpy).toHaveBeenCalled();
    });

    it('buildBoard should call the function fillDarkBlue', () => {
        const fillDarkBlueSpy = spyOn(service, 'fillDarkBlue').and.callThrough();
        service.buildBoard(wordSize);
        expect(fillDarkBlueSpy).toHaveBeenCalled();
    });

    it('buildBoard should call the function fillLightBlue', () => {
        const fillLightBlueSpy = spyOn(service, 'fillLightBlue').and.callThrough();
        service.buildBoard(wordSize);
        expect(fillLightBlueSpy).toHaveBeenCalled();
    });

    it('buildBoard should call the function fillPink', () => {
        const fillPinkSpy = spyOn(service, 'fillPink').and.callThrough();
        service.fillPink();
        expect(fillPinkSpy).toHaveBeenCalled();
    });

    it('buildBoard should call the function fillGreenTiles', () => {
        const fillGreenTilesSpy = spyOn(service, 'fillGreenTiles').and.callThrough();
        service.buildBoard(wordSize);
        expect(fillGreenTilesSpy).toHaveBeenCalled();
    });

    it('buildBoard should call the function drawWordRed', () => {
        const drawWordRedSpy = spyOn(service, 'drawWordRed').and.callThrough();
        service.buildBoard(wordSize);
        expect(drawWordRedSpy).toHaveBeenCalled();
    });

    it('buildBoard should call the function drawWordDarkBlue', () => {
        const drawWordDarkBlueSpy = spyOn(service, 'drawWordDarkBlue').and.callThrough();
        service.buildBoard(wordSize);
        expect(drawWordDarkBlueSpy).toHaveBeenCalled();
    });

    it('buildBoard should call the function drawWordLightBlue', () => {
        const drawWordLightBlueSpy = spyOn(service, 'drawWordLightBlue').and.callThrough();
        service.buildBoard(wordSize);
        expect(drawWordLightBlueSpy).toHaveBeenCalled();
    });

    it('buildBoard should call the function drawWordPink', () => {
        const drawWordPinkSpy = spyOn(service, 'drawWordPink').and.callThrough();
        service.buildBoard(wordSize);
        expect(drawWordPinkSpy).toHaveBeenCalled();
    });

    it('buildBoard should call the function drawGrid', () => {
        const drawGridSpy = spyOn(service, 'drawGrid').and.callThrough();
        service.buildBoard(wordSize);
        expect(drawGridSpy).toHaveBeenCalled();
    });

    it(' drawWord should call fillText on the canvas', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawWord('test', xpos, ypos, fontWord, step);
        expect(fillTextSpy).toHaveBeenCalled();
    });

    it(' drawWord should not call fillText if word is empty', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawWord('', xpos, ypos, fontWord, step);
        expect(fillTextSpy).toHaveBeenCalledTimes(0);
    });

    it(' drawWord should call fillText as many times as letters in a word', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        const word = 'test';
        service.drawWord(word, xpos, ypos, fontWord, step);
        expect(fillTextSpy).toHaveBeenCalledTimes(word.length);
    });

    it(' drawWord should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawWord('test', xpos, ypos, fontWord, step);
        imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it(' drawGrid should call moveTo and lineTo 30 times', () => {
        const expectedCallTimes = 30;
        const moveToSpy = spyOn(service.gridContext, 'moveTo').and.callThrough();
        const lineToSpy = spyOn(service.gridContext, 'lineTo').and.callThrough();
        service.drawGrid();
        expect(moveToSpy).toHaveBeenCalledTimes(expectedCallTimes);
        expect(lineToSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it('drawPosition should call drawWord 30 times', () => {
        const expectedCallTimes = 30;
        const drawWordSpy = spyOn(service, 'drawWord').and.callThrough();
        service.drawPosition();
        expect(drawWordSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it(' drawGrid should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawGrid();
        imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it('fillRed should color tiles in red', () => {
        const redTag = '#ff5349';
        service.fillRed();
        expect(service.gridContext.fillStyle).toBe(redTag);
    });
    it('fillDarkBlue should color tiles in DarkBlue', () => {
        const darkBlueTag = '#008cff';
        service.fillDarkBlue();
        expect(service.gridContext.fillStyle).toBe(darkBlueTag);
    });
    it('fillLightBlue should color tiles in LightBlue', () => {
        const lightBlueTag = '#00c8ff';
        service.fillLightBlue();
        expect(service.gridContext.fillStyle).toBe(lightBlueTag);
    });
    it('fillPink should color tiles in pink', () => {
        const pinkTag = '#ffc0cb';
        service.fillPink();
        expect(service.gridContext.fillStyle).toBe(pinkTag);
    });

    it('fillPositions should call fillColor 32 times', () => {
        const expectedCallTimes = 32;
        const fillColorSpy = spyOn(service, 'fillColor').and.callThrough();
        service.fillPositions();
        expect(fillColorSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it('removeLetter should call fillColor', () => {
        const fillColorSpy = spyOn(service, 'fillColor').and.callThrough();
        service.removeLetter(letters);
        expect(fillColorSpy).toHaveBeenCalled();
    });

    it('removeLetter should call drawDependColor', () => {
        const drawDependSpy = spyOn(service, 'drawDependColor').and.callThrough();
        service.removeLetter(letters);
        expect(drawDependSpy).toHaveBeenCalled();
    });

    it('removeLetter should set isFilled to false', () => {
        service.removeLetter(letters);
        for (const letter of letters) {
            expect(board.boardMatrix[letter.line][letter.column].isFilled).toBe(false);
        }
    });

    it('removeLetter should set isFilled to false', () => {
        service.removeLetter(letters);
        for (const letter of letters) {
            expect(board.boardMatrix[letter.line][letter.column].isFilled).toBe(false);
        }
    });

    it('drawDependColor should call drawStar if posx = 8 and posy = 8', () => {
        const drawStartSpy = spyOn(service, 'drawStar').and.callThrough();
        service.drawDependColor(8, 8, grid.pink);
        expect(drawStartSpy).toHaveBeenCalled();
    });

    it('drawDependColor should call drawMotAndFactorTwo if posx != 8 and posy != 8', () => {
        const drawMotAndFactorTwoSpy = spyOn(service, 'drawMotAndFactorTwo').and.callThrough();
        service.drawDependColor(7, 9, grid.pink);
        expect(drawMotAndFactorTwoSpy).toHaveBeenCalled();
    });

    it('drawDependColor should call drawLetterAndFactorTwo if color is lightblue', () => {
        const drawLetterAndFactorTwoSpy = spyOn(service, 'drawLetterAndFactorTwo').and.callThrough();
        service.drawDependColor(7, 9, grid.lightBlue);
        expect(drawLetterAndFactorTwoSpy).toHaveBeenCalled();
    });

    it('drawDependColor should call drawWordMot if color is red', () => {
        const drawWordMotSpy = spyOn(service, 'drawWordMot').and.callThrough();
        service.drawDependColor(7, 9, grid.red);
        expect(drawWordMotSpy).toHaveBeenCalled();
    });

    it('drawDependColor should call drawWordFactorThree if color is red', () => {
        const drawWordFactorThreeSpy = spyOn(service, 'drawWordFactorThree').and.callThrough();
        service.drawDependColor(7, 9, grid.red);
        expect(drawWordFactorThreeSpy).toHaveBeenCalled();
    });

    it('drawDependColor should call drawWordLetter if color is darkblue', () => {
        const drawWordLetterSpy = spyOn(service, 'drawWordLetter').and.callThrough();
        service.drawDependColor(7, 9, grid.darkBlue);
        expect(drawWordLetterSpy).toHaveBeenCalled();
    });

    it('drawDependColor should call FactorThree if color is darkblue', () => {
        const drawWordFactorThreeSpy = spyOn(service, 'drawWordFactorThree').and.callThrough();
        service.drawDependColor(7, 9, grid.darkBlue);
        expect(drawWordFactorThreeSpy).toHaveBeenCalled();
    });

    it('placeLetter should call fillColors three times', () => {
        const expectedCallTimes = 3;
        const fillColorSpy = spyOn(service, 'fillColor').and.callThrough();
        service.placeLetter(letters);
        expect(fillColorSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it('placeLetter should call writeLetter three times', () => {
        const expectedCallTimes = 3;
        const writeLetterSpy = spyOn(service, 'writeLetter').and.callThrough();
        service.placeLetter(letters);
        expect(writeLetterSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it('changeSizeLetters should call writeLetter if a tile is filled', () => {
        board = new Board();
        service.board.isTileFilled(3, 4);
        service.board.setLetter(3, 4, 'S');
        service.board.isTileFilled(4, 4);
        service.board.setLetter(4, 4, 'A');
        const expectedCallTimes = 2;
        const writeLetterSpy = spyOn(service, 'writeLetter').and.callThrough();
        service.changeSizeLetters(16);
        expect(writeLetterSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it('writePoint should call the function fillText', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.writePoint('z', 7, 9, 25);
        expect(fillTextSpy).toHaveBeenCalled();
    });

    it('writePoint should call the function fillText', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.writePoint('B', 7, 9, 25);
        expect(fillTextSpy).toHaveBeenCalled();
    });
});
