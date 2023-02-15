import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatMessage } from '@app/interfaces/chat-message';
import { Command } from '@app/interfaces/command';
import { ChatSocketClientService } from 'src/app/services/chat-socket-client.service';
import { ArgumentManagementService } from '@app/services/argument-management.service';
import { GridService } from '@app/services/grid.service';
import { Letter } from '@app/interfaces/letter';
import { Placement } from '@app/interfaces/placement';
import { KeyboardManagementService } from '@app/services/keyboard-management.service';

const GAME_COMMANDS: string[] = ['placer', 'échanger', 'passer'];
const HELP_COMMANDS: string[] = ['indice', 'réserve', 'aide'];
const THREE_SECOND = 3000;

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements OnInit {
    @ViewChild('scrollMessages') private scrollMessages: ElementRef;
    username = '';
    chatMessage = '';
    chatMessages: ChatMessage[] = [];
    socketTurn: string;
    isCommandSent = false;
    isGameFinished = false;
    writtenCommand = '';

    constructor(
        public socketService: ChatSocketClientService,
        public gridService: GridService,
        public arg: ArgumentManagementService,
        public keyboardService: KeyboardManagementService,
    ) {}
    automaticScroll() {
        this.scrollMessages.nativeElement.scrollTop = this.scrollMessages.nativeElement.scrollHeight;
    }
    ngOnInit(): void {
        this.connect();
    }
    connect() {
        this.configureBaseSocketFeatures();
        this.socketService.send('sendUsername');
    }
    verifyPlaceSocket() {
        this.socketService.on('verify-place-message', (placedWord: Placement) => {
            if (typeof placedWord.letters === 'string') {
                this.isCommandSent = false;
                this.chatMessages.push({
                    username: '',
                    message: placedWord.letters,
                    type: 'system',
                    time: '',
                });
            } else {
                this.socketService.send('remove-letters-rack', placedWord.letters);
                this.gridService.placeLetter(placedWord.letters as Letter[]);
                this.socketService.send('validate-created-words', placedWord);
            }
            this.gridService.board.resetStartTile();
            this.gridService.board.wordStarted = false;
            this.keyboardService.playPressed = false;
            this.keyboardService.enterPressed = false;
            setTimeout(() => this.automaticScroll(), 1);
        });
    }
    validatePlaceSockets() {
        this.socketService.on('validate-created-words', async (placedWord: Placement) => {
            this.socketService.send('freeze-timer');
            if (placedWord.points === 0) {
                await new Promise((r) => setTimeout(r, THREE_SECOND));
                this.chatMessages.push({
                    username: '',
                    message: 'Erreur : les mots crées sont invalides',
                    type: 'system',
                    time: '',
                });
                setTimeout(() => this.automaticScroll(), 1);
                this.gridService.removeLetter(placedWord.letters);
            } else {
                this.socketService.send('draw-letters-opponent', placedWord.letters);
                this.gridService.board.isFilledForEachLetter(placedWord.letters);
                this.gridService.board.setLetterForEachLetters(placedWord.letters);
                this.socketService.send('send-player-score');
                this.socketService.send('update-reserve');
            }
            this.isCommandSent = false;
            this.socketService.send('change-user-turn');
            this.socketService.send('draw-letters-rack');
        });
        this.socketService.on('draw-letters-opponent', (lettersPosition: Letter[]) => {
            this.gridService.placeLetter(lettersPosition as Letter[]);
            this.gridService.board.isFilledForEachLetter(lettersPosition as Letter[]);
            this.gridService.board.setLetterForEachLetters(lettersPosition as Letter[]);
        });
    }
    gameCommandSockets() {
        this.socketService.on('reserve-command', (command: Command) => {
            this.isCommandSent = false;
            this.chatMessages.push({
                username: '',
                message: command.name,
                type: 'system',
                time: '',
            });
        });
        this.socketService.on('help-command', (command: Command) => {
            this.isCommandSent = false;
            this.chatMessages.push({
                username: '',
                message: command.name,
                type: 'system',
                time: '',
            });
        });
        this.socketService.on('exchange-command', (command: Command) => {
            if (command.type === 'system') {
                this.isCommandSent = false;
                this.chatMessages.push({
                    username: '',
                    message: command.name,
                    type: 'system',
                    time: '',
                });
            } else {
                this.socketService.send('draw-letters-rack');
                this.socketService.send('change-user-turn');
                this.chatMessages.push({
                    username: '',
                    type: 'player',
                    message: `${this.username} : ${command.name}`,
                    time: '',
                });
                this.socketService.send('exchange-opponent-message', command.name.split(' ')[1].length);
                this.isCommandSent = false;
            }
        });
    }
    configureBaseSocketFeatures() {
        this.verifyPlaceSocket();
        this.validatePlaceSockets();
        this.gameCommandSockets();
        this.socketService.on('chatMessage', (chatMessage: ChatMessage) => {
            this.chatMessages.push(chatMessage);
            setTimeout(() => this.automaticScroll(), 1);
        });
        this.socketService.on('sendUsername', (uname: string) => {
            this.username = uname;
        });
        this.socketService.on('user-turn', (socketTurn: string) => {
            this.socketTurn = socketTurn;
        });
        this.socketService.on('virtual-player', () => {
            this.socketService.send('update-reserve');
        });
        this.socketService.on('end-game', () => {
            this.isGameFinished = true;
        });
    }
    validCommandName(message: string): Command {
        const commandName: string = message.split(' ')[0].substring(1);
        if (GAME_COMMANDS.includes(commandName)) {
            return { name: commandName, type: 'game', display: 'room' };
        } else if (HELP_COMMANDS.includes(commandName) && message.split(' ').length === 1) {
            return { name: commandName, type: 'help', display: 'local' };
        }
        this.isCommandSent = false;
        return { name: 'Entrée invalide: commande introuvable', type: 'system', display: 'local' };
    }
    placerCommand(): void {
        const placeCommand = this.arg.formatInput(this.chatMessage);
        if (placeCommand) {
            this.socketService.send('verify-place-message', placeCommand);
        } else {
            this.isCommandSent = false;
            this.chatMessages.push({
                username: '',
                message: 'Erreur Syntaxe: paramétres invalides',
                type: 'system',
                time: '',
            });
        }
    }
    passCommand(): void {
        this.socketService.send('chatMessage', this.writtenCommand);
        this.socketService.send('pass-turn');
        this.socketService.send('change-user-turn');
        this.isCommandSent = false;
    }
    exchangeCommand(): void {
        let lettersToExchange: string;
        try {
            lettersToExchange = this.chatMessage.split(' ')[1].trim();
            if (!lettersToExchange || /\d/.test(lettersToExchange)) {
                this.isCommandSent = false;
                this.chatMessages.push({ username: '', message: 'Erreur Syntaxe : parametres invalides', type: 'system', time: '' });
            } else this.socketService.send('exchange-command', lettersToExchange);
        } catch (e) {
            this.isCommandSent = false;
            this.chatMessages.push({ username: '', message: 'Erreur Sytaxe : parametres invalides', type: 'system', time: '' });
        }
    }
    sendCommand() {
        const command = this.validCommandName(this.chatMessage);
        if (command.type === 'game') {
            this.isCommandSent = true;
            this.writtenCommand = this.chatMessage;
            switch (command.name) {
                case 'placer':
                    this.placerCommand();
                    break;
                case 'échanger':
                    this.exchangeCommand();
                    break;
                case 'passer':
                    this.passCommand();
                    break;
            }
        } else if (command.type === 'help') {
            this.writtenCommand = this.chatMessage;
            switch (command.name) {
                case 'indice':
                    this.socketService.send('hint-command');
                    break;
                case 'réserve':
                    this.socketService.send('reserve-command');
                    break;
                case 'aide':
                    this.socketService.send('help-command');
                    break;
            }
            this.chatMessages.push({
                username: '',
                message: `${this.username} : ${this.writtenCommand}`,
                type: 'player',
                time: '',
            });
        } else {
            this.chatMessages.push({ username: '', message: command.name, type: 'system', time: '' });
        }
    }
    sendMessage() {
        if (this.chatMessage.startsWith('!')) {
            if (this.isGameFinished)
                this.chatMessages.push({ username: '', message: 'Commande impossible a réaliser : la partie est terminé', type: 'system', time: '' });
            else if (this.socketTurn !== this.socketService.socketId && this.chatMessage !== '!réserve' && this.chatMessage !== '!aide')
                this.chatMessages.push({
                    username: '',
                    message: "Commande impossible à réaliser : ce n'est pas à votre tour de jouer",
                    type: 'system',
                    time: '',
                });
            else if (!this.isCommandSent) this.sendCommand();
        } else {
            this.sendToRoom();
        }
        this.chatMessage = '';
        setTimeout(() => this.automaticScroll(), 1);
    }
    sendToRoom() {
        this.socketService.send('chatMessage', this.chatMessage);
        this.chatMessage = '';
    }
}
