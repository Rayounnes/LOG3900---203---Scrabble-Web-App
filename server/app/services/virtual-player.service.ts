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
            this.sio.to(room).emit('chatMessage', {
                username: scrabbleClassicGame.socketTurn,
                message: `${placeCommand.command}`,
                time: new Date().toTimeString().split(' ')[0],
                type: 'player',
                channel: room,
            });
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
            this.sio.to(room).emit('chatMessage', {
                username: scrabbleClassicGame.socketTurn,
                message: `!échanger ${lettersToExchange.length} lettre(s)`,
                time: new Date().toTimeString().split(' ')[0],
                type: 'player',
                channel: room,
            });
            return true;
        }
    }
    virtualPlayerPass(room: string, scrabbleGame: ScrabbleClassicMode) {
        this.sio.to(room).emit('chatMessage', {
            username: scrabbleGame.socketTurn,
            message: '!passer',
            time: new Date().toTimeString().split(' ')[0],
            type: 'player',
            channel: room,
        });
    }
}
