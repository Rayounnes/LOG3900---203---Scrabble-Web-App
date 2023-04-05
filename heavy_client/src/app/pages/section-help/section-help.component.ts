/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';

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
  description: 'Pour faire un placement, il faut placer les lettres dans un sens de lecture\ndu haut vers le bas ou de la gauche vers la droite.',
},

{
  image: 'assets/section-aide/classique/placement-indice.png',
  alt: 'Image 8',
  description: "Le premier bouton permet d'obtenir des indices. Le second bouton permet de valider le placement",
},


    ];

    itemsOrthography=[
      {
        image: 'assets/section-aide/mode-orthography/game-orthography.png',
        alt: 'Image 1',
        description: "Cliquez sur 'Commencer l'entrainement' pour lancer le jeu",
      },
      {
        image: 'assets/section-aide/mode-orthography/buttons-ortho.png',
        alt: 'Image 2',
        description: "Cliquez sur le mot qui vous semble correct",
      },
      {
        image: 'assets/section-aide/mode-orthography/chances.png',
        alt: 'Image 3',
        description: "Si le mot est faux, vous perdez une chance",
      },

    ]

    constructor() {}

    ngOnInit(): void {}

    showHelpClicked(mode: string) {
        this.showHelp = true;
        this.helpMode = mode;
    }

    backHelp() {
        this.showHelp = false;
        this.helpMode = '';
    }
}
