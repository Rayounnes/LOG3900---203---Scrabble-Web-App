/* eslint-disable @typescript-eslint/no-magic-numbers */
// c'est le fichier de constantes qui nous permets d'eviter d'avoir des nombres magiques
export const DEFAULT_WIDTH = 800;
export const DEFAULT_HEIGHT = 800;
export class GridConstants {
    black = 'rgb(76,80,80)';
    lightGreen = '#f3ae48';
    darkBlue = 'rgb(75 50 238)';
    lightBlue = 'rgb(111 186 241)';
    brown = 'rgb(194,178,128)';
    red = 'rgb(192 112 112)';
    pink = 'rgb(255 192 203)';
    beige = 'beige';
    gray = 'rgb(76,80,80)'
    greyTile = "rgb(128,128,128)"
    word = 'MOT';
    letter = 'LETTRE';
    factorTwo = 'x2';
    factorThree = 'x3';
    pixels = 'px system-ui';
    wordStep = 13;
    letterStep = 6;
    factorStep = 10;
    numberOfTiles = 16;
    startLine = 1;
    endLine = 16;
    startColumn = 1;
    endColumn = 16;
    shiftLetterLine = 0.05;
    shiftLetterColumn = 0.5;
    shiftFactorLine = 0.25;
    shiftFactorColumn = 0.9;
    aAscii = 97;
    defaultWidth = 800;
    defaultHeight = 800;
    oAscii = 111;
    tileSize = DEFAULT_HEIGHT/this.numberOfTiles;

}
