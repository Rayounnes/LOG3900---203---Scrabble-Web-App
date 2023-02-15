/* eslint-disable max-lines */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Command } from '@app/interfaces/command';
import { Placement } from '@app/interfaces/placement';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { Socket } from 'socket.io-client';
import { ChatBoxComponent } from './chat-box.component';
import { Letter } from '@app/interfaces/letter';

const WAITING_DELAY = 3000;

describe('ChatBoxComponent', () => {
    let socketService: ChatSocketClientService;
    let socketHelper: SocketTestHelper;
    let component: ChatBoxComponent;
    let fixture: ComponentFixture<ChatBoxComponent>;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        socketService = new ChatSocketClientService();
        socketService.socket = socketHelper as unknown as Socket;
        fixture = TestBed.createComponent(ChatBoxComponent);
        component = fixture.componentInstance;
        component.socketService = socketService;
        fixture.detectChanges();
    });

    it('should handle user-turn', () => {
        component.socketTurn = '33';
        const socketId = '123';
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('user-turn', socketId);
        expect(component.socketTurn).toEqual(socketId);
    });

    it('send-username event should change username', () => {
        component.username = 'first username';
        const uname = 'second username';
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('sendUsername', uname);
        expect(component.username).toEqual(uname);
    });

    it('chatMessage event should add the chatmessage to the array', () => {
        const spy = spyOn(component.chatMessages, 'push');
        const chatMessage = {
            username: '',
            time: '',
            message: 'hello',
            type: 'system',
        };
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('chatMessage', chatMessage);
        expect(spy).toHaveBeenCalledWith(chatMessage);
    });

    it('exchange-command event should call chatMessages.push if command is type system', () => {
        const spy = spyOn(component.chatMessages, 'push');
        const command = {
            username: '',
            time: '',
            name: 'hello',
            type: 'system',
        };
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('exchange-command', command);
        expect(spy).toHaveBeenCalled();
    });

    it('exchange-command event should send an event if command is not of type system', () => {
        const spy = spyOn(component.socketService, 'send');
        const command: Command = {
            name: '!échanger hasd asdf asdf as',
            type: 'game',
            display: 'display',
        };
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('exchange-command', command);
        expect(spy).toHaveBeenCalled();
    });

    it('validate-created-words event should call socketService.send if the score is not 0', () => {
        component.isCommandSent = true;
        const parameter = {
            letters: [{ line: 2, column: 3, value: 'a' }],
            points: 8,
            command: 'string',
        } as Placement;

        spyOn(component.gridService.board, 'isFilledForEachLetter').and.stub();
        spyOn(component.gridService.board, 'setLetterForEachLetters').and.stub();
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('validate-created-words', parameter);
        expect(component.isCommandSent).toEqual(false);
    });

    it('validate-created-words event should push the parameter to the chatMessages if the score is 0', fakeAsync(() => {
        const parameter = {
            letters: [{ line: 2, column: 3, value: 'a' }],
            points: 0,
            command: 'string',
        };

        const spy = spyOn(component.chatMessages, 'push');
        spyOn(component.gridService, 'removeLetter').and.stub();

        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('validate-created-words', parameter);
        tick(WAITING_DELAY + 1);
        expect(spy).toHaveBeenCalled();
    }));

    it('verify-place-message event call placeLetter from gridService', fakeAsync((): void => {
        const spy = spyOn(component.gridService, 'placeLetter').and.stub();
        const letter: Letter[] = [
            {
                line: 8,
                column: 8,
                value: '4',
            },
        ];
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('verify-place-message', letter);
        tick(1);
        expect(spy).toHaveBeenCalled();
    }));

    it('virtual-player event should send update-reserve', fakeAsync((): void => {
        const spy = spyOn(component.socketService, 'send');
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('virtual-player');
        expect(spy).toHaveBeenCalled();
    }));

    it('draw-letters-opponent event should call placeLetter', () => {
        const letter: Letter[] = [
            {
                line: 8,
                column: 8,
                value: '4',
            },
        ];
        const spy = spyOn(component.gridService, 'placeLetter').and.stub();
        spyOn(component.gridService.board, 'isFilledForEachLetter').and.stub();
        spyOn(component.gridService.board, 'setLetterForEachLetters').and.stub();
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('draw-letters-opponent', letter);
        expect(spy).toHaveBeenCalled();
    });

    it('verify-place-message event should push the letter into the chatMessages', () => {
        const spy = spyOn(component.chatMessages, 'push');
        const letter = 'IamAString';
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('verify-place-message', {
            letters: letter,
            orientation: 'h',
        });
        expect(spy).toHaveBeenCalled();
    });

    it('connect should call configureBaseSocketFeatures', () => {
        const spy = spyOn(component, 'configureBaseSocketFeatures');
        component.connect();
        expect(spy).toHaveBeenCalled();
    });

    it('sendMessage should call sendCommand', () => {
        component.socketTurn = '';
        component.chatMessage = '!placer';
        const spy = spyOn(component, 'sendCommand');
        component.sendMessage();
        expect(spy).toHaveBeenCalled();
    });

    it('sendMessage should call push if game is finished', () => {
        component.isGameFinished = true;
        component.chatMessage = '!placer';
        const spy = spyOn(component.chatMessages, 'push');
        component.sendMessage();
        expect(spy).toHaveBeenCalled();
    });

    it('sendMessage should call sendCommand if commandSent is true', () => {
        component.isGameFinished = false;
        component.isCommandSent = false;
        component.chatMessage = '!réserve';
        const spy = spyOn(component, 'sendCommand');
        component.sendMessage();
        expect(spy).toHaveBeenCalled();
    });

    it('sendMessage should call sendRoom', () => {
        component.chatMessage = 'placer';
        const spy = spyOn(component, 'sendToRoom');
        component.sendMessage();
        expect(spy).toHaveBeenCalled();
    });

    it('sendMessage should push command', () => {
        component.chatMessage = '!placer';
        const spy = spyOn(component.chatMessages, 'push');
        component.socketTurn = '';
        component.socketService.socket.id = 'ff';
        component.sendMessage();
        expect(spy).toHaveBeenCalled();
    });

    it('sendToRoom should reinitialise chatMessage', () => {
        const spy = spyOn(component.socketService, 'send');
        component.sendToRoom();
        expect(spy).toHaveBeenCalled();
        expect(component.chatMessage).toEqual('');
    });

    it('placerCommand should return command of type help ', () => {
        component.isCommandSent = true;
        const message = '!indice';
        const expected = component.validCommandName(message);
        expect(expected.type).toEqual('help');
    });

    it('placerCommand should return command of type game ', () => {
        component.isCommandSent = true;
        const message = '!placer';
        const expected = component.validCommandName(message);
        expect(expected.type).toEqual('game');
    });

    it('isCommand should become false', () => {
        component.isCommandSent = true;
        const message = '!ok';
        component.validCommandName(message);
        expect(component.isCommandSent).toEqual(false);
    });

    it('placerCommand adds the message to the list', () => {
        const spy = spyOn(component.chatMessages, 'push');
        component.chatMessage = 'invalide';
        component.placerCommand();
        expect(spy).toHaveBeenCalled();
    });

    it('placerCommand should send the verification event', () => {
        const spy = spyOn(component.socketService, 'send');
        const command = {
            line: 2,
            column: 2,
            orientation: 'a',
            value: 'b',
        };
        spyOn(component.arg, 'formatInput').and.returnValue(command);
        component.placerCommand();
        expect(spy).toHaveBeenCalled();
    });

    it('command of type game should call placerCommand', () => {
        spyOn(component, 'validCommandName').and.returnValue({ name: 'placer', type: 'game', display: 'room' });
        const spy = spyOn(component, 'placerCommand');
        component.sendCommand();
        expect(spy).toHaveBeenCalled();
    });

    it('command of type game should call placerCommand', () => {
        spyOn(component, 'validCommandName').and.returnValue({ name: 'échanger', type: 'game', display: 'room' });
        const spy = spyOn(component, 'exchangeCommand');
        component.sendCommand();
        expect(spy).toHaveBeenCalled();
    });

    it('command of type game should call placerCommand', () => {
        spyOn(component, 'validCommandName').and.returnValue({ name: 'passer', type: 'game', display: 'room' });
        const spy = spyOn(component, 'passCommand');
        component.sendCommand();
        expect(spy).toHaveBeenCalled();
    });

    it('exchangeCommand with letters should call send', () => {
        component.chatMessage = '!échanger hve';
        // spyOn(component, 'validCommandName').and.returnValue({ name: 'placer', type: 'not game', display: 'room' });
        const spy = spyOn(component.socketService, 'send');
        component.sendCommand();
        expect(spy).toHaveBeenCalled();
    });

    it('exchangeCommand empty should call push error event', () => {
        component.chatMessage = '!échanger ';
        const spy = spyOn(component.chatMessages, 'push');
        component.sendCommand();
        expect(spy).toHaveBeenCalled();
    });

    it('should handle end game', () => {
        component.isGameFinished = false;
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('end-game');
        expect(component.isGameFinished).toEqual(true);
    });

    it('empty message should call push error event', () => {
        component.chatMessage = '';
        const spy = spyOn(component.chatMessages, 'push');
        component.exchangeCommand();
        expect(spy).toHaveBeenCalled();
    });

    it('command of any type other than game should not call placerCommand', () => {
        spyOn(component, 'validCommandName').and.returnValue({ name: 'placer', type: 'not game', display: 'room' });
        const spy = spyOn(component, 'placerCommand');
        component.sendCommand();
        expect(spy).not.toHaveBeenCalled();
    });

    it('command type of help and name of indice should send an event', () => {
        spyOn(component, 'validCommandName').and.returnValue({ name: 'indice', type: 'help', display: 'room' });
        const spy = spyOn(component.socketService, 'send');
        component.sendCommand();
        expect(spy).toHaveBeenCalled();
    });

    it('pass command should send an event', () => {
        const spy = spyOn(component.socketService, 'send');
        component.passCommand();
        expect(spy).toHaveBeenCalled();
    });

    it('automatique scroll should  send an event', () => {
        const spy = spyOn(component.socketService, 'send');
        component.passCommand();
        expect(spy).toHaveBeenCalled();
    });

    it("user should be able to use !réserve command even if it's not his turn to play", () => {
        component.chatMessage = '!réserve';
        const spy = spyOn(component.chatMessages, 'push');
        component.sendCommand();
        expect(spy).toHaveBeenCalled();
    });

    it('reserve-command event should call chatMessages.push if command is type local', () => {
        const spy = spyOn(component.chatMessages, 'push');
        const command = {
            name: 'hello',
            type: 'local',
        };
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('reserve-command', command);
        expect(spy).toHaveBeenCalled();
    });

    it("user should be able to use !aide command even if it's not his turn to play", () => {
        component.chatMessage = '!aide';
        const spy = spyOn(component.chatMessages, 'push');
        component.sendCommand();
        expect(spy).toHaveBeenCalled();
    });

    it('should return error message if unexisting command is entered', () => {
        component.chatMessage = '!aideeeee';
        component.sendMessage();
        const spy = spyOn(component, 'sendCommand');
        expect(spy).not.toHaveBeenCalled();
    });

    it('help-command event should display the message if command is type local', () => {
        const spy = spyOn(component.chatMessages, 'push');
        const command = {
            name: '!passer: Permet de sauter votre tour.',
            type: 'local',
        };
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('help-command', command);
        expect(spy).toHaveBeenCalled();
    });
});
