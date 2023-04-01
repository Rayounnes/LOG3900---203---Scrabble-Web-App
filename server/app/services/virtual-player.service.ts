import * as io from 'socket.io';
import { Placement } from '@app/interfaces/placement';
import { Service } from 'typedi';
import { Command } from '@app/interfaces/command';
import { ScrabbleClassicMode } from '@app/classes/scrabble-classic-mode';

@Service()
export class VirtualPlayerService {
    private sio: io.Server;

    constructor(sio: io.Server) {
        this.sio = sio;
    }
    virtualPlayerPlace(room: string, scrabbleClassicGame: ScrabbleClassicMode): boolean {
        const placeCommand: Placement = scrabbleClassicGame.placeWordVirtual();
        if (placeCommand.points === 0) {
            return false;
        } else {
            this.sio.to(room).emit('draw-letters-opponent', placeCommand.letters);
            this.sio.to(room).emit('virtual-player');
            const message = `${scrabbleClassicGame.socketTurn}: ${placeCommand.command}`;
            for (const opponentSocket of scrabbleClassicGame.notTurnSockets) this.sio.to(opponentSocket).emit('player-action', message);
            for (const observerSocket of scrabbleClassicGame.observers) this.sio.to(observerSocket).emit('player-action', message);
            this.sio.to(room).emit('update-reserve', scrabbleClassicGame.getReserveLettersLength());
            return true;
        }
    }
    virtualPlayerExchange(room: string, scrabbleClassicGame: ScrabbleClassicMode): boolean {
        const lettersToExchange: string = scrabbleClassicGame.lettersToExchange;
        if (!lettersToExchange) return false;
        const command: Command = scrabbleClassicGame.exchangeVirtualPlayer(lettersToExchange);
        if (command.type === 'system') return false;
        else {
            const message = `${scrabbleClassicGame.socketTurn} a échangé ${lettersToExchange.length} lettre(s)`;
            for (const opponentSocket of scrabbleClassicGame.notTurnSockets) this.sio.to(opponentSocket).emit('player-action', message);
            for (const observerSocket of scrabbleClassicGame.observers) this.sio.to(observerSocket).emit('player-action', message);
            return true;
        }
    }
    virtualPlayerPass(room: string, scrabbleGame: ScrabbleClassicMode) {
        const message = `${scrabbleGame.socketTurn} a passé son tour`;
        for (const opponentSocket of scrabbleGame.notTurnSockets) this.sio.to(opponentSocket).emit('player-action', message);
        for (const observerSocket of scrabbleGame.observers) this.sio.to(observerSocket).emit('player-action', message);
    }
}
