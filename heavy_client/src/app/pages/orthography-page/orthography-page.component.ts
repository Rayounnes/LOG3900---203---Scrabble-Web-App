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
  chances = 3;
  hideButton = false;

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
    console.log(this.wordOfTraining);
    
  }

  getWordsForMode() {
    this.communicationService.getAllWords().subscribe((allWordsOrthography: any) => {
        
        this.allWords = allWordsOrthography;
        console.log(this.allWords);
        for (let i = 0; i < 1; i++) {
          const randomIndex = Math.floor(Math.random() * this.allWords.length);
          this.wordOfTraining.push(this.allWords[randomIndex]);
          this.allWords.splice(randomIndex, 1);
        console.log(this.wordOfTraining);
        }
    });
  
}

  onClick(wordItem : any) {
    console.log(wordItem);

    if (wordItem.answer) {
      alert("Vous avez gagné !");
    } else {
      this.chances--;
    }
  }

  leavePage() {
    this.router.navigate(['/home'])
  }

}

