/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';

@Component({
    selector: 'app-section-help',
    templateUrl: './section-help.component.html',
    styleUrls: ['./section-help.component.scss'],
})
export class SectionHelpComponent implements OnInit {
    showHelp = false;
    helpMode = '';
    itemsClassic = [
        {
            image: 'assets/section-aide/classique/modeclassique.png',
            alt: 'Image 1',
            description:
                "Le mode classique est un mode de jeu dans lequel 4 adversaires s'affrontent.\n Il faut au minimum de 2 joueurs humains.\n Une limite de temps est accordé à chaque tour pour faire un placement",
        },
        {
            image: 'assets/section-aide/classique/parties.png',
            alt: 'Image 2',
            description: 'Pour créer une partie selon vos préférences, cliquer sur le bouton "Créer une Partie".',
        },
        {
            image: 'assets/section-aide/classique/creationpartie.png',
            alt: 'Image 3',
            description: 'Vous avez la possibilité de rendre vos parties privées\net de choisir le temps de chaque tour.',
        },
        {
            image: 'assets/section-aide/classique/listeparties.png',
            alt: 'Image 4',
            description: "Ceci est la salle d'attente avant de rejoindre une partie.\nLes informations de la partie y sont présentées.",
        },
        {
            image: 'assets/section-aide/classique/salleattente.png',
            alt: 'Image 5',
            description: "Le créateur d'une partie peut décider de commencer la partie ou de l'annuler.",
        },
    ];

    itemsClassicEn = [
        {
            image: 'assets/section-aide/classique/modeclassique.png',
            alt: 'Image 1',
            description:
                'The classic mode is a game mode in which 4 opponents compete against each other. It takes a minimum of 2 human players. A time limit is granted to each round to make a placement.',
        },
        {
            image: 'assets/section-aide/classique/parties.png',
            alt: 'Image 2',
            description: 'To create a game according to your preferences, click on the "Create a game" button.',
        },
        {
            image: 'assets/section-aide/classique/creationpartie.png',
            alt: 'Image 3',
            description: 'You have the option to make your games private and choose the time of each round.',
        },
        {
            image: 'assets/section-aide/classique/listeparties.png',
            alt: 'Image 4',
            description: 'This is the waiting room before joining a game. The information in the part is presented there',
        },
        {
            image: 'assets/section-aide/classique/salleattente.png',
            alt: 'Image 5',
            description: 'The creator of a game can decide to start the game or cancel it.',
        },
    ];

    itemsButtons = [
        {
            image: 'assets/section-aide/classique/passer.png',
            alt: 'Image 6',
            description: 'Ce bouton permet de passer son tour.',
        },
        {
            image: 'assets/section-aide/classique/exchange1.png',
            alt: 'Image 7',
            description: "Ce bouton permet de d'échanger les lettres du chevalet.",
        },
        {
            image: 'assets/section-aide/classique/exchange2.png',
            alt: 'Image 8',
            description: 'Vous pouvez sélectionner les lettres à échanger.',
        },
        {
            image: 'assets/section-aide/classique/placement1.png',
            alt: 'Image 8',
            description:
                'Pour faire un placement, il faut placer les lettres dans un sens de lecture\ndu haut vers le bas ou de la gauche vers la droite.',
        },

        {
            image: 'assets/section-aide/classique/placement-indice.png',
            alt: 'Image 8',
            description: "Le premier bouton permet d'obtenir des indices. Le second bouton permet de valider le placement",
        },
    ];

    itemsButtonsEn = [
        {
            image: 'assets/section-aide/classique/passer.png',
            alt: 'Image 6',
            description: 'This button allows you to skip your turn.',
        },
        {
            image: 'assets/section-aide/classique/exchange1.png',
            alt: 'Image 7',
            description: 'This button allows you to exchange the letters of the rack.',
        },
        {
            image: 'assets/section-aide/classique/exchange2.png',
            alt: 'Image 8',
            description: 'You can select the letters to be exchanged.',
        },
        {
            image: 'assets/section-aide/classique/placement1.png',
            alt: 'Image 8',
            description: 'To make a placement, you must place the letters in a reading direction from top to bottom or from left to right.',
        },

        {
            image: 'assets/section-aide/classique/placement-indice.png',
            alt: 'Image 8',
            description: 'The first button is used to get clues. The second button is used to validate the placement.',
        },
    ];

    itemsProfil = [
        {
            image: 'assets/section-aide/profil/historique.png',
            alt: 'Image 8',
            description:
                "En cliquant sur cet icone, l'utilisateur accède à son historique de connexions et de déconnexions de l'application. L'utilisateur accède à ses statistiques tel que son nombre de victoires et ses parties jouées.",
        },
        {
            image: 'assets/section-aide/profil/changeavatar.png',
            alt: 'Image 8',
            description: "Voici un exemple de modification de l'avatar.",
        },

        {
            image: 'assets/section-aide/profil/changeusername.png',
            alt: 'Image 8',
            description: "Voici un exemple de modification du nom d'utilisateur",
        },
    ];


    itemsProfilEn = [
      {
          image: 'assets/section-aide/profil/historique.png',
          alt: 'Image 8',
          description:
                'By clicking on this icon, the user accesses his history of connections and disconnections from the application. The user accesses his statistics such as his number of victories and his games played.',
      },
      {
          image: 'assets/section-aide/profil/changeavatar.png',
          alt: 'Image 8',
          description: "Here's an example of changing the avatar",
      },

      {
          image: 'assets/section-aide/profil/changeusername.png',
          alt: 'Image 8',
          description: "Here is an example of changing the username.",
      },
    ];

    itemsCooperative = [
        {
            image: 'assets/section-aide/cooperatif/modecooperatif.png',
            alt: 'Image 8',
            description:
                "Le mode coopératif est un mode de jeu dans lequel tous les joueurs coopèrent pour remplir le plateau de lettres.Le minimum de joueurs est de 2 et le maximum est de 4.Les joueurs partagent le même chevalet, donc ils doivent s'entendre pour les placements.Il n'y a pas de limite de temps ni de joueurs virtuels.",
        },
        {
            image: 'assets/section-aide/cooperatif/demandeaction.png',
            alt: 'Image 8',
            description: "Lorsqu'un joueur fait un placement, il sera en attente de la validation de ses coéquipiers.",
        },

        {
            image: 'assets/section-aide/cooperatif/acceptation.png',
            alt: 'Image 8',
            description: "Lorsqu'un coéquipier fait un placement, vous pouvez accepter ou refuser.",
        },
    ];


    itemsCooperativeEn = [
      {
          image: 'assets/section-aide/cooperatif/modecooperatif.png',
          alt: 'Image 8',
          description:
              "Co-op mode is a game mode in which all players cooperate to fill the board with letters. The minimum number of players is 2 and the maximum is 4.Players share the same rack, so they must agree on placements. There is no time limit or virtual players.",
      },
      {
          image: 'assets/section-aide/cooperatif/demandeaction.png',
          alt: 'Image 8',
          description: "When a player makes a placement, he will be waiting for validation from his teammates.",
      },

      {
          image: 'assets/section-aide/cooperatif/acceptation.png',
          alt: 'Image 8',
          description: "When a teammate makes a placement, you can accept or refuse.",
      },
  ];

    itemsOrthography = [
        {
            image: 'assets/section-aide/mode-orthography/mode-entrainement.png',
            alt: 'Image 1',
            description:
                "Le mode orthographe est un mode pour pratiquer son orthographe. Ce mode n'affectera pas vos points d'expérience. Vous avez le droit à 3 chances. Si vous faites 3 erreurs, vous perdez.",
        },
        {
            image: 'assets/section-aide/mode-orthography/game-orthography.png',
            alt: 'Image 1',
            description: "Cliquez sur 'Commencer l'entrainement' pour lancer le jeu",
        },
        {
            image: 'assets/section-aide/mode-orthography/buttons-ortho.png',
            alt: 'Image 2',
            description: 'Cliquez sur le mot qui vous semble correct',
        },
        {
            image: 'assets/section-aide/mode-orthography/chances.png',
            alt: 'Image 3',
            description: 'Si le mot est faux, vous perdez une chance',
        },
    ];



    itemsOrthographyEn = [
      {
          image: 'assets/section-aide/mode-orthography/mode-entrainement.png',
          alt: 'Image 1',
          description:
              "The spelling mode is a mode to practice its spelling. This mode will not affect your experience points. You have the right to 3 chances. If you make 3 mistakes, you lose.",
      },
      {
          image: 'assets/section-aide/mode-orthography/game-orthography.png',
          alt: 'Image 1',
          description: "Click on 'Start Training' to launch the game.",
      },
      {
          image: 'assets/section-aide/mode-orthography/buttons-ortho.png',
          alt: 'Image 2',
          description: 'Click on the word that seems correct to you.',
      },
      {
          image: 'assets/section-aide/mode-orthography/chances.png',
          alt: 'Image 3',
          description: 'If the word is wrong, you lose a chance',
      },
  ];

  langue = ""
  theme = ""

    constructor(private socketService: ChatSocketClientService, public router: Router) {}

    ngOnInit(): void {
        this.connect()
    }

    showHelpClicked(mode: string) {
        this.showHelp = true;
        this.helpMode = mode;
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
        this.socketService.on('get-config',(config : any)=>{
            this.langue = config.langue;
            this.theme = config.theme;
        })
        this.socketService.send('get-config')
    }

    backHelp() {
        this.showHelp = false;
        this.helpMode = '';
    }

    navHome() {
        this.router.navigate(['/home']);
    }
}
