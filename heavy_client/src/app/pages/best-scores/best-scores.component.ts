import { Component, OnInit } from '@angular/core';
import { TopScore } from '@app/interfaces/top-scores';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-best-scores',
    templateUrl: './best-scores.component.html',
    styleUrls: ['./best-scores.component.scss'],
})
export class BestScoresComponent implements OnInit {
    displayedColumnsClassic: string[] = ['playerNameClassic-position', 'scoreClassic-position'];
    displayedColumnsLog2990: string[] = ['playerNameLog2990-position', 'scoreLog2990-position'];

    dataSourceClassic: TopScore[];
    dataSourceLog: TopScore[];

    constructor(private communicationService: CommunicationService) {
        this.dataSourceClassic = [];
        this.dataSourceLog = [];
    }

    ngOnInit() {
        this.displayScoresClassic();
        this.displayScoresLog();
    }
    displayScoresClassic(): void {
        this.communicationService.bestScoresClassicGet().subscribe((scores) => {
            this.dataSourceClassic = scores;
        });
    }

    displayScoresLog(): void {
        this.communicationService.bestScoresLogGet().subscribe((scores) => {
            this.dataSourceLog = scores;
        });
    }
}
