import { Component, OnInit, Input } from '@angular/core';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';

const TIPS_FR = [
    'Astuces : Passez votre tour en dernier recours,il est toujours mieux de placer une lettre.',
    "Aide : Vous pouvez modifier votre nom d'utilisateur sur la page de profil.",
    'Le saviez-vous : Les premiers sets de Scrabble fabriqués à la main coutaient 2,50 dollars chacun.',
    "Astuces : Lorsqu'il n'est pas possible de former un mot, échangez les lettres de votre chevalet.",
    "Aide : Déplacez sur l'écran l'icone de musique pour mieux voir le plateau de jeu.",
    "Le saviez-vous : Scrabble est dérivé de l'anglais et signifie 'gratter' ou 'creuser'. ",
    'Astuces : Apprendre des mots courts augmentera vos chances de placer des mots.',
    'Aide : Diminuez le son de la musique de fond pour vous concentrer.',
    "Le saviez-vous : Le Scrabble a été créé en 1938 par l'architecte américain Alfred Mosher Butts.",
    'Astuces : Essayer de mettre des mots au pluriel pour maximiser les points.',
    "Aide : Le mode Orthographe est un bon moyen de se pratiquer et d'améliorer son vocabulaire.",
    'Le saviez-vous : Un championnat national de Scrabble aux États-Unis a rassemblé en août 2021 plus de 300 joueurs.',
    'Astuces : Les mots longs ont souvent une valeur élevée et peuvent rapporter beaucoup de points.',
    "Le saviez-vous : La FISF est l'acronyme pour Fédération Internationale de Scrabble Francophone.",
    "Aide : Sur la page d'accueil, cliquez le bouton profil pour voir vos informations.",
    'Le saviez-vous : En 2020, la FISF a ajouté 3 000 nouveaux mots dans sa liste officielle',
    'Astuces : Utilisez les cases bonus (x2, x3, ...) pour maximiser vos points.',
    "Aide : Il est possible d'observer une partie en cours,(Ex: mode classique --> rejoindre une partie --> observer).",
    "Le saviez-vous : Les lettres du jeu sont réparties en fonction de leur fréquence d'utilisation en fonction de la langue.",
    'Astuces : Planifiez votre prochain coup en avance en évaluant les combinaisons possibles.',
    "Aide : N'hésitez pas à changer votre avatar, cela est possible sur la page de profil.",
    "Le saviez-vous : Le mot qui peut donner le plus grand nombre de point est 'oxyphenbutazone'.",
    'Aide : Si vous oubliez votre mot de passe, cliquez sur mot de passe oublié.',
    'Astuces : Bloquez les espaces pour empêcher votre adversaire de marquer des points.',
    'Le saviez-vous : Le Scrabble est disponible dans plus de 120 pays et est disponible en 29 langues différentes.',
    'Aide : Pour restreindre la visibilité vos parties, mettez votre partie en privée à la création.',
    "Astuces : Rajouter des mots de 2 lettres tels que 'ne', 'ni', 'on' , 'je' , etc.",
    'Aide : Vos historiques de connexions et de déconnexions sont accessibles sur la page de profil.',
    'Le saviez-vous : Le Scrabble est considéré comme un sport mental et est joué en compétition à travers le monde.',
    "Astuces : Tentez des agencements de lettres si vous n'avez plus d'idée.",
];

const TIPS_EN = [
    "Tips: Pass your turn as a last resort, it's always better to place a letter.",
    "Help: You can change your username on the profile page.",
    "Did you know: The first handmade Scrabble sets cost $2.50 each.",
    "Tips: When it's not possible to form a word, exchange the letters on your rack.",
    "Help: Move the music icon on the screen to see the game board better.",
    "Did you know: Scrabble is derived from the English word 'scrabble' which means to scratch or scrape.",
    "Tips: Learning short words will increase your chances of placing words.",
    "Help: Lower the volume of the background music to focus.",
    "Did you know: Scrabble was created in 1938 by American architect Alfred Mosher Butts.",
    "Tips: Try to make words plural to maximize points.",
    "Help: The Spelling mode is a good way to practice and improve your vocabulary.",
    "Did you know: A national Scrabble championship in the United States brought together over 300 players in August 2021.",
    "Tips: Long words often have a high value and can earn a lot of points.",
    "Did you know: FISF stands for International French Scrabble Federation.",
    "Help: On the homepage, click the profile button to see your information.",
    "Did you know: In 2020, FISF added 3,000 new words to its official list.",
    "Tips: Use bonus squares (x2, x3, ...) to maximize your points.",
    "Help: It's possible to observe a game in progress (e.g. classic mode -> join game -> observe).",
    "Did you know: The letters in the game are distributed based on their frequency of use in the language.",
    "Tips: Plan your next move in advance by evaluating possible combinations.",
    "Help: Don't hesitate to change your avatar, this is possible on the profile page.",
    "Did you know: The word that can score the highest number of points is 'oxyphenbutazone'.",
    "Help: If you forget your password, click on forgot password.",
    "Tips: Block spaces to prevent your opponent from scoring points.",
    "Did you know: Scrabble is available in over 120 countries and is available in 29 different languages.",
    "Help: To restrict the visibility of your games, make your game private at creation.",
    "Tips: Add 2-letter words such as 'ne', 'ni', 'on', 'je', etc.",
    "Help: Your login and logout histories are accessible on the profile page.",
    "Did you know: Scrabble is considered a mental sport and is played competitively around the world.",
    "Tips: Try letter combinations if you run out of ideas.",
];

const SLIDE_INTERVAL = 5000;
@Component({
    selector: 'app-tips',
    templateUrl: './tips.component.html',
    styleUrls: ['./tips.component.scss'],
})
export class TipsComponent implements OnInit {
    @Input() tips = TIPS_FR;
    @Input() controls = false;
    @Input() autoSlide = false;
    @Input() slideInterval = SLIDE_INTERVAL;

    selectedIndex = 0;
    langue = '';
    theme = '';
    englishTips = TIPS_EN;
    constructor(public socketService: ChatSocketClientService) {
        this.connect();
    }
    ngOnInit(): void {
        if (this.autoSlide) {
            this.autoSlideTips();
        }
        this.connect();
    }

    autoSlideTips(): void {
        setInterval(() => {
            this.onNextClick();
        }, this.slideInterval);
    }
    selectedTip(index: number): void {
        this.selectedIndex = index;
    }

    onPrevClick(): void {
        if (this.selectedIndex === 0) {
            this.selectedIndex = this.tips.length - 1;
        } else {
            this.selectedIndex--;
        }
    }

    configureBaseSocketFeatures() {
        this.socketService.on('get-config', (config: any) => {
            this.langue = config.langue;
            this.theme = config.theme;
        });
    }

    connect() {
        this.configureBaseSocketFeatures();
        this.socketService.send('get-config');
    }

    onNextClick(): void {
        if (this.selectedIndex === this.tips.length - 1) {
            this.selectedIndex = 0;
        } else {
            this.selectedIndex++;
        }
    }
}
