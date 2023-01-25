/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { TestBed } from '@angular/core/testing';
import { Board } from '@app/classes/board';
import { Vec2 } from '@app/interfaces/vec2';
import * as gridConstants from 'src/constants/grid-constants';
import { MouseManagementService } from './mouse-management.service';

describe('MouseManagementService', () => {
    let service: MouseManagementService;
    let positionStart: Vec2;
    let grid: gridConstants.GridConstants;
    let board: Board;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MouseManagementService);
        positionStart = { x: 3, y: 3 };
        grid = new gridConstants.GridConstants();
        board = new Board();
        board.resetStartTile();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('fillTheTile should call fillColor', () => {
        const fillColorSpy = spyOn<any>(service.gridService, 'fillColor').and.callFake(() => {
            return;
        });
        service.fillTheTile(positionStart, grid.beige);
        expect(fillColorSpy).toHaveBeenCalled();
    });

    it('findPosition should return the line', () => {
        const line = 5;
        const posToFind = 200;
        const result = service.findPosition(posToFind);
        expect(result).toEqual(line);
    });

    it('letterOnGrid should call getIsFiled', () => {
        const spy = spyOn(service.gridService.board, 'getIsFilled');
        service.letterOnGrid({ x: 1, y: 2 });
        expect(spy).toHaveBeenCalled();
    });

    it('disable should call draw', () => {
      spyOn(service.gridService.board, 'getStartTile').and.returnValue({x: 1, y: 2});
      const spy = spyOn(service.gridService, 'fillColor');
      service.disablePreviousStart();
      expect(spy).toHaveBeenCalled();
  });

    it('detectOnCanvas should call drawGrid if button is not 0', () => {
        const evt = {
            offsetX: 5,
            offsetY: 5,
            button: 0,
        } as MouseEvent;

        spyOn(service, 'letterOnGrid').and.returnValue(false);

        spyOn(service.gridService, 'drawGrid').and.stub();
        const spy = spyOn(service, 'drawArrow').and.stub();
        spyOn(service.gridService.board, 'setStartTile').and.stub();
        spyOn(service.gridService.board, 'resetStartTile').and.stub();
        spyOn(service, 'fillTheTile').and.stub();
        
        service.detectOnCanvas(evt);
        expect(spy).toHaveBeenCalled();
    });

    it('findTileWithMouse should return the tile when we click', () => {
        const tile = { x: 5, y: 5 };
        const result = service.findTileWithMouse({ x: 200, y: 200 });
        expect(result).toEqual(tile);
    });
    

    it('drawRightArrow should call writeLetter() from gridService', () => {
        const spy = spyOn(service.gridService, 'writeLetter');
        service.drawRightArrow({ x: 1, y: 4 });
        expect(spy).toHaveBeenCalled();
    });

    it('drawDownArrow should call writeLetter() from gridService', () => {
        const spy = spyOn(service.gridService, 'writeLetter');
        service.drawDownArrow({ x: 1, y: 4 });
        expect(spy).toHaveBeenCalled();
    });

    it('drawArrow should call drawRightArrow() if the direction is v', () => {
        spyOn(service.gridService.board, 'getDirection').and.returnValue('h');
        const spy = spyOn(service, 'drawRightArrow');
        service.drawArrow({ x: 1, y: 4 });
        expect(spy).toHaveBeenCalled();
    });

    it('drawArrow should call drawDownArrow() if the direction is v', () => {
        spyOn(service.gridService.board, 'getDirection').and.returnValue('v');
        const spy = spyOn(service, 'drawDownArrow');
        service.drawArrow({ x: 1, y: 4 });
        expect(spy).toHaveBeenCalled();
    });

});
