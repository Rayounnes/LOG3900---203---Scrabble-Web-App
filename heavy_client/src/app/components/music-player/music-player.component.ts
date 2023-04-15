import { Component, OnInit } from '@angular/core';
interface bgMusic {
    title: string;
    src: string;
}
const PLAYLIST: bgMusic[] = [
    { title: 'Dragon Ball Lofi', src: 'assets/DB Music.mp3' },
    { title: 'Naruto Lofi', src: 'assets/NARUTO Music.mp3' },
    { title: 'AOT Music', src: 'assets/AOT Music.mp3' },
    { title: 'CSM Music', src: 'assets/CSM Music.mp3' },
    { title: 'Fumetsu Music', src: 'assets/Fumetsu Music.mp3' },
    { title: 'OP Lofi', src: 'assets/OP Music.mp3' },
];

@Component({
    selector: 'app-music-player',
    templateUrl: './music-player.component.html',
    styleUrls: ['./music-player.component.scss'],
})
export class MusicPlayerComponent implements OnInit {
    isPLaying: boolean = false;
    audio = new Audio();
    musicID = 0;
    volume = 0;

    ngOnInit(): void {
        this.audio.title = PLAYLIST[this.musicID].title;
        this.audio.src = PLAYLIST[this.musicID].src;
        this.audio.load();
        this.audio.volume = 0.5;
    }

    playMusic(): void {
        this.audio.title = PLAYLIST[this.musicID].title;
        this.audio.load();
        this.play();
    }

    playPause(): void {
        if (!this.isPLaying) {
            this.play();
        } else {
            this.pause();
        }
    }

    play(): void {
        this.isPLaying = true;
        this.audio.play();
    }

    pause(): void {
        this.isPLaying = false;
        this.audio.pause();
    }

    nextMusic(): void {
        if (this.musicID === PLAYLIST.length - 1) {
            this.musicID = 0;
        } else {
            this.musicID++;
        }

        this.audio.src = PLAYLIST[this.musicID].src;
        this.playMusic();
    }

    prevMusic(): void {
        if (this.musicID === 0) {
            this.musicID = PLAYLIST.length - 1;
        } else {
            this.musicID--;
        }

        this.audio.src = PLAYLIST[this.musicID].src;
        this.playMusic();
    }

    changeVolume(volumeInput: string): void {
        this.audio.volume = Number(volumeInput) / 100;
    }
}
