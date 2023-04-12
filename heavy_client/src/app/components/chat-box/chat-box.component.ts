/* eslint-disable max-lines */
import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ChatMessage } from '@app/interfaces/chat-message';
import { Command } from '@app/interfaces/command';
import { ChatSocketClientService } from 'src/app/services/chat-socket-client.service';
import { ArgumentManagementService } from '@app/services/argument-management.service';
import { GridService } from '@app/services/grid.service';
// import { Letter } from '@app/interfaces/letter';
// import { Placement } from '@app/interfaces/placement';
import { KeyboardManagementService } from '@app/services/keyboard-management.service';
import { CommunicationService } from '@app/services/communication.service';
import { FormControl } from '@angular/forms';
import { debounceTime, switchMap, startWith } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

const GAME_COMMANDS: string[] = ['placer', 'échanger', 'passer'];
const HELP_COMMANDS: string[] = ['indice', 'réserve', 'aide'];
// const THREE_SECOND = 3000;

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
    template: `{{ now | date: 'HH:mm:ss' }}`,
})
export class ChatBoxComponent implements OnInit, OnDestroy {
    @ViewChild('scrollMessages') private scrollMessages: ElementRef;
    @ViewChild('channels') private channels: ElementRef;

    username = '';
    chatMessage = '';
    chatMessages: ChatMessage[] = [];
    socketTurn: string;
    isCommandSent = false;
    isGameFinished = false;
    writtenCommand = '';
    langue = ""
    theme = ""

    allUserChannels: any[] = [];
    currentChannel: string = 'General';
    searching: boolean = false;
    search = new FormControl();
    currentSearch: string = '';
    userChannelsNames: string[] = [];
    allChannelsNames: string[] = [];
    channelsControl = new FormControl();
    userTyping: boolean = false;
    usersIcons : Map<string,string> = new Map<string,string>()

    constructor(
        public socketService: ChatSocketClientService,
        public gridService: GridService,
        public arg: ArgumentManagementService,
        public keyboardService: KeyboardManagementService,
        private communicationService: CommunicationService,
        private _snackBar: MatSnackBar,
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
        this.socketService.send('get-config');
    }
    // verifyPlaceSocket() {
    //     this.socketService.on('verify-place-message', (placedWord: Placement) => {
    //         if (typeof placedWord.letters === 'string') {
    //             this.isCommandSent = false;
    //             this.chatMessages.push({
    //                 username: '',
    //                 message: placedWord.letters,
    //                 type: 'system',
    //                 time: '',
    //             });
    //         } else {
    //             this.socketService.send('remove-letters-rack', placedWord.letters);
    //             this.gridService.placeLetter(placedWord.letters as Letter[]);
    //             console.log("Sending validate-created-words");
    //             this.socketService.send('validate-created-words', placedWord);
    //         }
    //         this.gridService.board.resetStartTile();
    //         this.gridService.board.wordStarted = false;
    //         this.keyboardService.playPressed = false;
    //         this.keyboardService.enterPressed = false;
    //         setTimeout(() => this.automaticScroll(), 1);
    //     });
    // }
    // validatePlaceSockets() {
    //     this.socketService.on('validate-created-words', async (placedWord: Placement) => {
    //         console.log("received validate-created-words");
    //         this.socketService.send('freeze-timer');
    //         if (placedWord.points === 0) {
    //             await new Promise((r) => setTimeout(r, THREE_SECOND));
    //             this.chatMessages.push({
    //                 username: '',
    //                 message: 'Erreur : les mots crées sont invalides',
    //                 type: 'system',
    //                 time: '',
    //             });
    //             setTimeout(() => this.automaticScroll(), 1);
    //             this.gridService.removeLetter(placedWord.letters);
    //         } else {
    //             this.socketService.send('draw-letters-opponent', placedWord.letters);
    //             this.gridService.board.isFilledForEachLetter(placedWord.letters);
    //             this.gridService.board.setLetterForEachLetters(placedWord.letters);
    //             this.socketService.send('send-player-score');
    //             this.socketService.send('update-reserve');
    //         }
    //         this.isCommandSent = false;
    //         console.log("sending change-user-turn and draw-letters-rack");
    //         this.socketService.send('change-user-turn');
    //         this.socketService.send('draw-letters-rack');
    //     });
    //     this.socketService.on('draw-letters-opponent', (lettersPosition: Letter[]) => {
    //         this.gridService.placeLetter(lettersPosition as Letter[]);
    //         this.gridService.board.isFilledForEachLetter(lettersPosition as Letter[]);
    //         this.gridService.board.setLetterForEachLetters(lettersPosition as Letter[]);
    //     });
    // }
    gameCommandSockets() {
        // this.socketService.on('reserve-command', (command: Command) => {
        //     this.isCommandSent = false;
        //     this.chatMessages.push({
        //         username: '',
        //         message: command.name,
        //         type: 'system',
        //         time: '',
        //     });
        // });
        // this.socketService.on('help-command', (command: Command) => {
        //     this.isCommandSent = false;
        //     this.chatMessages.push({
        //         username: '',
        //         message: command.name,
        //         type: 'system',
        //         time: '',
        //     });
        // });
        // this.socketService.on('exchange-command', (command: Command) => {
        //     if (command.type === 'system') {
        //         this.isCommandSent = false;
        //         this.chatMessages.push({
        //             username: '',
        //             message: command.name,
        //             type: 'system',
        //             time: '',
        //         });
        //     } else {
        //         this.socketService.send('draw-letters-rack');
        //         this.socketService.send('change-user-turn');
        //         this.chatMessages.push({
        //             username: '',
        //             type: 'player',
        //             message: `${this.username} : ${command.name}`,
        //             time: '',
        //         });
        //         this.socketService.send('exchange-opponent-message', command.name.split(' ')[1].length);
        //         this.isCommandSent = false;
        //     }
        // });
    }
    ngOnDestroy(): void {
        console.log("disposing chat sockets");
        this.socketService.socket.off('chatMessage');
        this.socketService.socket.off('sendUsername');
        this.socketService.socket.off('change-username');
        this.socketService.socket.off('user-turn');
        this.socketService.socket.off('virtual-player');
        this.socketService.socket.off('end-game');
        this.socketService.socket.off('channel-created');
        this.socketService.socket.off('duplicate-name');
        this.socketService.socket.off('channels-joined');
        this.socketService.socket.off('leave-channel');
        this.socketService.socket.off('isTypingMessage');
        this.socketService.socket.off('isNotTypingMessage');
        this.socketService.socket.off('icon-change');
        this.socketService.socket.off('game-won');
        this.socketService.socket.off('game-loss');
        this.socketService.socket.off('update-points-mean');
        this.socketService.socket.off('get-config');
    }
    configureBaseSocketFeatures() {
        // this.verifyPlaceSocket();
        // this.validatePlaceSockets();
        this.gameCommandSockets();
        this.socketService.on('chatMessage', (chatMessage: ChatMessage) => {
            let channel: any;
            for (channel of this.allUserChannels) {
                if (channel['name'] === chatMessage.channel) {
                    this.checkUniqueUserIcon(chatMessage.username)
                    channel.messages.push(chatMessage);
                    //if (channel.messages[0].length === 0) channel.messages.shift();
                    if (channel['name'] === this.currentChannel) {
                        this.chatMessages = channel.messages;
                    } else {
                        channel['unread'] = true;
                    }
                }
            }
            setTimeout(() => this.automaticScroll(), 1);
        });
        this.socketService.on('sendUsername', (uname: string) => {
            this.username = uname;
            this.getUserChannels();
        });
        this.socketService.on('change-username', (infos: any) => {
            if(infos['id'] == this.socketService.socketId){
                this.username = infos['username'];
            }
            
            this.getUserChannels();
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
        this.socketService.on('channel-created', (newChannel: any) => {
            /* newChannel['unread'] = false;
            newChannel['typing'] = [false, 0];
            this.allUserChannels.push(newChannel);
            this.changeChannel(newChannel); */
            this.getUserChannels();
        });
        this.socketService.on('duplicate-name',()=>{
            if(this.langue == 'fr'){
                this._snackBar.open(
                    "Un channel avec le meme nom existe deja !",
                    'Fermer',
                );
            }else{
                this._snackBar.open(
                    "A channel with the same name already exists",
                    'Close',
                );
            }
            
        })
        this.socketService.on('channels-joined', () => {
            this.getUserChannels();
        });
        this.socketService.on('leave-channel', () => {
            this.getUserChannels();
        });
        this.socketService.on('isTypingMessage', (message: any) => {
            console.log(message);
            if (message.player !== this.username) {
                let channel: any;
                for (channel of this.allUserChannels) {
                    if (channel['name'] === message.channel) {
                        let old = channel['typing'];
                        old[2].push(message.player);
                        channel['typing'] = [true, old[1] + 1, old[2]];
                    }
                }
                setTimeout(() => this.automaticScroll(), 1);
            }
        });
        this.socketService.on('isNotTypingMessage', (message: any) => {
            if (message.player !== this.username) {
                let channel: any;
                for (channel of this.allUserChannels) {
                    if (channel['name'] === message.channel) {
                        let old = channel['typing'];
                        let index = old[2].indexOf(message.player);
                        old[2].splice(index, 1);
                        channel['typing'] = [true, old[1] - 1, old[2]];
                    }
                }
                setTimeout(() => this.automaticScroll(), 1);
            }
        });
        this.socketService.on('icon-change',(infos : any)=>{
            this.usersIcons.set(infos.username, infos.icon)
            console.log(infos)
        })
        this.socketService.on('game-won',() =>{
            console.log('partie gagnée')
            this.socketService.send('game-won')
            this.socketService.send('game-history-update',true)
        })
        this.socketService.on('game-loss',() =>{
            this.socketService.send('game-history-update',false)
        })
        this.socketService.on("update-points-mean",(points : number)=>{
            this.socketService.send("update-points-mean",points)
        })
        this.socketService.on('get-config',(config : any)=>{
            this.langue = config.langue;
            this.theme = config.theme;
        })
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
        // if (this.chatMessage.startsWith('!')) {
        //     if (this.isGameFinished)
        //         this.chatMessages.push({ username: '', message: 'Commande impossible a réaliser : la partie est terminé', type: 'system', time: '' });
        //     else if (this.socketTurn !== this.socketService.socketId && this.chatMessage !== '!réserve' && this.chatMessage !== '!aide')
        //         this.chatMessages.push({
        //             username: '',
        //             message: "Commande impossible à réaliser : ce n'est pas à votre tour de jouer",
        //             type: 'system',
        //             time: '',
        //         });
        //     else if (!this.isCommandSent) this.sendCommand();
        // } else {
        this.sendToRoom();
        this.chatMessage = '';
        setTimeout(() => this.automaticScroll(), 1);
    }
    sendToRoom(personnalizedMessage?: boolean) {
        const message: ChatMessage = {
            username: this.username,
            message: this.chatMessage,
            time: new Date().toTimeString().split(' ')[0],
            type: 'player',
            channel: this.currentChannel,
        };
        this.socketService.send('chatMessage', message);
        this.chatMessage = '';
        if (!personnalizedMessage) this.isNotTyping(true);
    }

    personalizedMessage(event: any) {
        if (this.chatMessage.length > 0) {
            this.chatMessage = event.target.innerText;
            this.sendToRoom(false);
        } else {
            this.chatMessage = event.target.innerText;
            this.sendToRoom(true);
        }
    }

    isTyping(event: any) {
        if (event.key !== 'Enter' && event.key !== 'Backspace' && this.chatMessage.length === 0) {
            const message: ChatMessage = {
                username: this.username,
                message: 'typing',
                time: new Date().toTimeString().split(' ')[0],
                type: 'player',
                channel: this.currentChannel,
            };
            this.socketService.send('isTypingMessage', message);
            this.userTyping = true;
        }
    }

    isNotTyping(forceSend?: boolean) {
        if ((this.chatMessage.length === 1 && this.userTyping) || forceSend) {
            const message: ChatMessage = {
                username: this.username,
                message: '',
                time: new Date().toTimeString().split(' ')[0],
                type: 'player',
                channel: this.currentChannel,
            };
            this.socketService.send('isTypingMessage', message);
            this.userTyping = false;
        }
    }

    scrollChannels(direction: string) {
        if (direction === 'right') {
            this.channels.nativeElement.scrollLeft += 90;
            return;
        }
        this.channels.nativeElement.scrollLeft -= 90;
    }

    searchChannels() {
        this.searching = !this.searching;
        if (!this.searching) {
            setTimeout(() => this.automaticScroll(), 1);
            return;
        }
        this.setupSearchArrays();
    }

    async setupSearchArrays() {
        this.userChannelsNames = [];
        for (const channel of this.allUserChannels) {
            this.userChannelsNames.push(channel.name);
        }
        await this.communicationService.getAllChannels().subscribe((allChannelsNames: any) => {
            this.allChannelsNames = allChannelsNames;
        });
        this.channelsControl.setValue([]);
    }

    $search = this.search.valueChanges.pipe(
        startWith(null),
        debounceTime(200),
        switchMap((res: string) => {
            let newChannelsList: string[] = [];
            if (!res) {
                newChannelsList = this.allChannelsNames
                    .map((name) => {
                        if (this.userChannelsNames.indexOf(name) == -1) {
                            return name;
                        }
                        return '';
                    })
                    .filter((channel) => channel !== '');

                return of(newChannelsList);
            }

            for (let channel of this.allChannelsNames) {
                if (channel.includes(res.toString()) && this.userChannelsNames.indexOf(channel) === -1) {
                    newChannelsList.push(channel);
                }
            }
            this.currentSearch = res;
            return of(newChannelsList);
        }),
    );

    selectionChange(option: any) {
        let value = this.channelsControl.value || [];
        if (option.selected) value.push(option.value);
        else value = value.filter((x: any) => x !== option.value);
        this.channelsControl.setValue(value);
    }

    addChannels() {
        if (this.channelsControl.value?.length > 0) {
            // Si l'utilisateur veut juste rejoindre des channels deja existants
            this.socketService.send('join-channel', this.channelsControl.value);
            this.currentSearch = '';
            this.searching = false;
            return;
        }
        //Si l'utilisateur veut créé son propre channel
        if (this.currentSearch.length === 0 || this.userChannelsNames.indexOf(this.currentSearch) !== -1) {
            return;
        }
        this.socketService.send('channel-creation', this.currentSearch);
        this.currentSearch = '';
        this.searching = false;
        setTimeout(() => this.automaticScroll(), 1);
        return;
    }

    changeChannel(newChannel: string) {
        if (newChannel !== this.currentChannel) {
            this.currentChannel = newChannel;
            let channel: any;
            for (channel of this.allUserChannels) {
                if (channel['name'] === newChannel) {
                    this.chatMessages = channel['messages'];
                    setTimeout(() => this.automaticScroll(), 1);
                    channel['unread'] = false;
                    return;
                }
            }
        }
    }

    leaveChannel() {
        this.socketService.send('leave-channel', this.currentChannel);
    }

    deleteChannel() {
        this.socketService.send('delete-channel', this.currentChannel);
    }

    getUserChannels() {
        this.communicationService.getUserChannels(this.username).subscribe((userChannels: any): void => {
            this.allUserChannels = userChannels;
            this.currentChannel = 'General';
            let channel: any;
            for (channel of this.allUserChannels) {
                this.checkAllUsersIcon(channel['messages'])
                if (channel['name'] === 'General') {
                    this.chatMessages = channel['messages'];
                    //if (channel.messages[0].length === 0) this.chatMessages.shift();
                    setTimeout(() => this.automaticScroll(), 1);
                }
                channel['unread'] = false;
                channel['typing'] = [false, 0, []];
            }
        });
    }

    async checkAllUsersIcon(messages: any) {
        const keysArray: string[] = Array.from(this.usersIcons.keys());
        //if(messages[0].length == 0) messages.shift()
        for (let message of messages) {
          if (!keysArray.includes(message['username'])) {
            const icon: string[] = await this.communicationService.getAvatar(message['username']).toPromise();
            this.usersIcons.set(message['username'], icon[0]);
            keysArray.push(message['username'])
          }
        }
    }
      
    async checkUniqueUserIcon(username: string) {
    const keysArray: string[] = Array.from(this.usersIcons.keys());
    if (!keysArray.includes(username)) {
        const icon: string[] = await this.communicationService.getAvatar(username).toPromise();
        this.usersIcons.set(username, icon[0]);
    }
    }

    getIcon(username : string){
        if(this.usersIcons.get(username)) return this.usersIcons.get(username)
        return ""
    }
}
