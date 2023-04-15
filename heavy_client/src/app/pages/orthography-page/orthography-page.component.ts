import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { CommunicationService } from '@app/services/communication.service';

@Component({
  selector: 'app-orthography-page',
  templateUrl: './orthography-page.component.html',
  styleUrls: ['./orthography-page.component.scss']
})
export class OrthographyPageComponent implements OnInit {

  constructor(public router: Router, public socketService: ChatSocketClientService, private communicationService: CommunicationService,) { 
    this.connect();
  }

  allWords: any[] = [];
  wordOfTraining: any[] = [];
  currentWord:any;
  stateWord = 0;
  numberWordsTotal=10;
  chances = 3;
  hideButton = false;
  gameOver = false;
  modeDone = false;
  successMessage = false;
  score = 0;
  bestScore = 0;
  username = "";
  langue = ""
  theme = ""
  ngOnInit(): void {
  
  }


  configureBaseSocketFeatures() {
    this.socketService.on('sendUsername', (name: string) => {
        this.username = name;
        this.getBestScoreOfPlayer();
    });
    this.socketService.on('get-config',(config : any)=>{
      this.langue = config.langue;
      this.theme = config.theme;
  })
}

connect() {
  this.configureBaseSocketFeatures();
  this.socketService.send('sendUsername');
  this.socketService.send('get-config')
}

  countdown = 0;

  startCountdown() {
    
    this.hideButton = true;
    this.countdown = 3;
    const countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
    
    this.getWordsForMode();

    
  }

  getBestScoreOfPlayer() {
    let param = this.username ? this.username : this.socketService.socketId;
    this.communicationService.getBestScore(param).subscribe((bestScore: any) : void => {
      this.bestScore = bestScore.bestScore; 
  });

  }

  getWordsForMode() {
    this.communicationService.getAllWords(this.langue).subscribe((allWordsOrthography: any) => {
        
        this.allWords = allWordsOrthography;
        console.log(this.allWords);
        for (let i = 0; i < 50; i++) {
          const randomIndex = Math.floor(Math.random() * this.allWords.length);
          this.wordOfTraining.push(this.allWords[randomIndex]);
          this.allWords.splice(randomIndex, 1);
        console.log(this.wordOfTraining);
        this.currentWord = this.wordOfTraining[this.stateWord];
        }
    });
  
}

onClick(wordItem: any) {
  if (wordItem.answer) {
    if (this.chances === 3) {
      this.score += 20;
    } else if (this.chances === 2) {
      this.score += 10;
    } else if (this.chances === 1) {
      this.score += 5;
    }
    this.successMessage = true;
    this.verifyIfModeDone();
  } else {
    this.chances--;
    if (this.chances == 0) {
      this.gameOver = true;
      this.socketService.send('score-orthography', this.score);
    }
  }
}

  leavePage() {
    this.router.navigate(['/home'])
  }

  shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  

  verifyIfModeDone() {
    if(this.stateWord + 1 !== this.numberWordsTotal) {
      this.stateWord++;
      this.currentWord = this.wordOfTraining[this.stateWord];
      this.currentWord = this.shuffleArray(this.currentWord);
      this.successMessage = false;
      console.log(this.currentWord);
    }
    else {
      this.modeDone = true;
      this.socketService.send('score-orthography', this.score);
      this.countdown = 3;
    }

  }

}

