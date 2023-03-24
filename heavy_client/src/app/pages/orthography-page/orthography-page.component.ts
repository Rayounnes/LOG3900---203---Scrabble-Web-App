import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';

@Component({
  selector: 'app-orthography-page',
  templateUrl: './orthography-page.component.html',
  styleUrls: ['./orthography-page.component.scss']
})
export class OrthographyPageComponent implements OnInit {

  constructor(public router: Router, private communicationService: CommunicationService,) { }

  allWords: any[] = [];
  wordOfTraining: any[] = [];
  currentWord:any;
  stateWord = 0;
  numberWordsTotal=2;
  chances = 3;
  hideButton = false;
  gameOver = false;
  modeDone = false;
  successMessage = false;

  ngOnInit(): void {
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

  getWordsForMode() {
    this.communicationService.getAllWords().subscribe((allWordsOrthography: any) => {
        
        this.allWords = allWordsOrthography;
        console.log(this.allWords);
        for (let i = 0; i < 2; i++) {
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
    this.successMessage = true;
    this.verifyIfModeDone();
  } else {
    this.chances--;
    if (this.chances == 0) {
      this.gameOver = true;
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
    }

  }

}

