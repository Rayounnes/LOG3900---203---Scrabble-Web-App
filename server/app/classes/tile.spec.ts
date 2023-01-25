import { assert, expect } from 'chai';
import { Tile } from './tile';
describe('Tile tests', () => {
    let tile: Tile;
    it('tile is created', () => {
        tile = new Tile();
        assert.isDefined(tile);
    });
    it('tile is created with the word parameters', () => {
        tile = new Tile(1, 2);
        expect(tile.wordMultiplicator).to.eql(2);
    });
    it('tile is created with the letter parameters', () => {
        tile = new Tile(3);
        expect(tile.letterMultiplicator).to.eql(3);
    });
});
