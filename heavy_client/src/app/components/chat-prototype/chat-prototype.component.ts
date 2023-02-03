
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatMessage } from '@app/interfaces/chat-message';
import { ChatSocketClientService } from 'src/app/services/chat-socket-client.service';
import { ArgumentManagementService } from '@app/services/argument-management.service';
import { GridService } from '@app/services/grid.service';
import { KeyboardManagementService } from '@app/services/keyboard-management.service';

@Component({
  selector: 'app-chat-prototype',
  templateUrl: './chat-prototype.component.html',
  styleUrls: ['./chat-prototype.component.scss'],
  template: `{{ now | date:'HH:mm:ss'}}`
})
export class ChatPrototypeComponent implements OnInit {
  @ViewChild('scrollMessages') private scrollMessages: ElementRef;
  @ViewChild('input') private input: ElementRef;

  username = '';
  chatMessage = '';
  chatMessages: ChatMessage[] = [];
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
  
  
  configureBaseSocketFeatures() {
      this.socketService.on('chatMessage', (chatMessage: ChatMessage) => {
          chatMessage.time = `(${new Date().getHours() + ':' + new Date().getMinutes() + ':'+  new Date().getSeconds()})`
          this.chatMessages.push(chatMessage);
          setTimeout(() => this.automaticScroll(), 1);
      });
      this.socketService.on('sendUsername', (uname: string) => {
          this.username = uname;
      });
      this.socketService.on('end-game', () => {
          this.isGameFinished = true;
      });
  }

  sendMessage() {
      
      this.sendToRoom();
      this.chatMessage = '';
      setTimeout(() => this.automaticScroll(), 1);
      setTimeout(()=>{ 
        this.input.nativeElement.focus();
      },0);

      
  }

  sendToRoom() {
      this.socketService.send('chatMessage', this.chatMessage);
      this.chatMessage = '';
  }
}


