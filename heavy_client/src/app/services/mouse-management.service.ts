import { GridService } from '@app/services/grid.service';
import { Vec2 } from '@app/interfaces/vec2';
import * as gridConstants from 'src/constants/grid-constants';
import { Injectable } from '@angular/core';

enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}
const tileNumber = 16;
@Injectable({
    providedIn: 'root',
})
export class MouseManagementService {
    readonly numberOfTiles = tileNumber;
    grid = new gridConstants.GridConstants();
    mousePosition: Vec2 = { x: 0, y: 0 };
    constructor(public gridService: GridService) {}

    detectOnCanvas(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
        }

        if (!this.letterOnGrid(this.findTileWithMouse(this.mousePosition))) {
            this.disablePreviousStart();
            this.gridService.board.resetStartTile();
            this.gridService.board.setStartTile(this.findTileWithMouse(this.mousePosition).y, this.findTileWithMouse(this.mousePosition).x);
            this.fillTheTile(this.findTileWithMouse(this.mousePosition), this.grid.beige);
            this.drawArrow(this.findTileWithMouse(this.mousePosition));
            this.gridService.drawGrid();
        }
    }

    letterOnGrid(position: Vec2) {
        return this.gridService.board.getIsFilled(position.y, position.x);
    }
    disablePreviousStart() {
        const position = this.gridService.board.getStartTile();
        if (position !== undefined) {
            this.gridService.fillColor(position.x + 1, position.y + 1, this.gridService.board.getColor(position.y + 1, position.x + 1));
            this.gridService.drawDependColor(position.x + 1, position.y + 1, this.gridService.board.getColor(position.y + 1, position.x + 1));
        }
    }

    findPosition(position: number) {
        return Math.trunc((this.grid.numberOfTiles / this.grid.defaultHeight) * position);
    }

    findTileWithMouse({ x, y }: Vec2): Vec2 {
        const column = this.findPosition(x);
        const line = this.findPosition(y);
        return { x: column, y: line };
    }

    fillTheTile({ x, y }: Vec2, color: string) {
        this.gridService.fillColor(x, y, color);
    }

    drawRightArrow({ x, y }: Vec2) {
        const shiftX = 0.2;
        const shiftY = 0.15;
        const size = 50;
        const unicodeArrow = '\u{02192}';
        this.gridService.writeLetter(unicodeArrow, x - shiftX, y + shiftY, size);
    }

    drawDownArrow({ x, y }: Vec2) {
        const shiftX = 0.05;
        const shiftY = 0.2;
        const size = 50;
        const unicodeArrow = '\u{02193}';
        this.gridService.writeLetter(unicodeArrow, x + shiftX, y + shiftY, size);
    }

    drawArrow({ x, y }: Vec2) {
        if (this.gridService.board.getDirection({ x: x - 1, y: y - 1 }) === 'h') {
            this.drawRightArrow({ x, y });
            this.gridService.board.changeDirection({ x: x - 1, y: y - 1 }, 'v');
        } else if (this.gridService.board.getDirection({ x: x - 1, y: y - 1 }) === 'v') {
            this.drawDownArrow({ x, y });
            this.gridService.board.changeDirection({ x: x - 1, y: y - 1 }, 'h');
        }
    }
}
