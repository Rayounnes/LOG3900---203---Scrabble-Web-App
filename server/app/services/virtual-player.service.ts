import { ScrabbleClassic } from '@app/classes/scrabble-classic';
import * as io from 'socket.io';
import { ScrabbleClassicSolo } from '@app/classes/scrabble-classic-solo';
import { Placement } from '@app/interfaces/placement';
import { Service } from 'typedi';
import { Command } from '@app/interfaces/command';
@Service()
export class VirtualPlayerService {
    private sio: io.Server;

    constructor(sio: io.Server) {
        this.sio = sio;
    }
    virtualPlayerPlace(room: string, scrabbleSoloGame: ScrabbleClassicSolo): boolean {
        const placeCommand: Placement = scrabbleSoloGame.placeWordVirtual();
        if (placeCommand.points === 0) {
            return false;
        } else {
            this.sio.to(room).emit('draw-letters-opponent', placeCommand.letters);
            this.sio.to(room).emit('update-player-score', {
                points: scrabbleSoloGame.getPlayerScore(scrabbleSoloGame.virtualName),
                playerScored: false,
                tiles: scrabbleSoloGame.getPlayerTilesLeft(scrabbleSoloGame.virtualName),
            });
            this.sio.to(room).emit('virtual-player');
            this.sio.to(room).emit('chatMessage', { type: 'player', message: `${scrabbleSoloGame.virtualName} : ${placeCommand.command}` });
            return true;
        }
    }
    virtualPlayerExchange(room: string, scrabbleSoloGame: ScrabbleClassicSolo): boolean {
        const lettersToExchange: string = scrabbleSoloGame.lettersToExchange;
        if (!lettersToExchange) return false;
        const command: Command = scrabbleSoloGame.exchangeVirtualPlayer(lettersToExchange);
        if (command.type === 'system') return false;
        else {
            this.sio.to(room).emit('chatMessage', {
                type: 'player',
                message: `${scrabbleSoloGame.socketTurn} : !échanger ${lettersToExchange.length} lettre(s)`,
            });
            return true;
        }
    }
    virtualPlayerPass(room: string, scrabbleGame: ScrabbleClassic) {
        scrabbleGame.incrementStreakPass();
        this.sio.to(room).emit('chatMessage', { type: 'player', message: `${scrabbleGame.socketTurn} : !passer` });
    }
}
