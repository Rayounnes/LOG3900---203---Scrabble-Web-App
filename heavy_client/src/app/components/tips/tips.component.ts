import { Component, OnInit } from '@angular/core';

const TIPS_FR = [
    'Astuces : Passez votre tour en dernier recours,il est toujours mieux de placer une lettre.',
    "Aide : Vous pouvez modifier votre nom d'utilisateur sur la page de profil.",
    'Le saviez-vous : Les premiers sets de Scrabble fabriqués à la main coutaient 2,50 dollars chacun.',
    "Astuces : Lorsqu'il n'est pas possible de former un mot, échangez les lettres de votre chevalet.",
  "Aide : Déplacez sur l'écran l'icone de musique pour mieux voir le plateau de jeu.",
  "Le saviez-vous : Scrabble est dérivé de l'anglais et signifie 'gratter' ou 'creuser'. ",
  "Astuces : Apprendre des mots courts augmentera vos chances de placer des mots.",
    'Aide : Diminuez le son de la musique de fond pour vous concentrer.',
  "Le saviez-vous : Le Scrabble a été créé en 1938 par l'architecte américain Alfred Mosher Butts.",
  "Astuces : Essayer de mettre des mots au pluriel pour maximiser les points.",
  "Aide : Le mode Orthographe est un bon moyen de se pratiquer et d'améliorer son vocabulaire.",
  "Le saviez-vous : Un championnat national de Scrabble aux États-Unis a rassemblé en août 2021 plus de 300 joueurs.",
  "Astuces : Les mots longs ont souvent une valeur élevée et peuvent rapporter beaucoup de points.",
  "Le saviez-vous : La FISF est l'acronyme pour Fédération Internationale de Scrabble Francophone.",
  "Aide : Sur la page d'accueil, cliquez le bouton profil pour voir vos informations.",
  "Le saviez-vous : En 2020, la FISF a ajouté 3 000 nouveaux mots dans sa liste officielle",
  "Astuces : Utilisez les cases bonus (x2, x3, ...) pour maximiser vos points.",
  "Aide : Il est possible d'observer une partie en cours,(Ex: mode classique --> rejoindre une partie --> observer).",
  "Le saviez-vous : Les lettres du jeu sont réparties en fonction de leur fréquence d'utilisation en fonction de la langue.",
  "Astuces : Planifiez votre prochain coup en avance en évaluant les combinaisons possibles.",
  "Aide : N'hésitez pas à changer votre avatar, cela est possible sur la page de profil.",
  "Le saviez-vous : Le mot qui peut donner le plus grand nombre de point est 'oxyphenbutazone'.",
  "Aide : Si vous oubliez votre mot de passe, cliquez sur mot de passe oublié.",
  "Astuces : Bloquez les espaces pour empêcher votre adversaire de marquer des points.",
  "Le saviez-vous : Le Scrabble est disponible dans plus de 120 pays et est disponible en 29 langues différentes.",
  "Aide : Pour restreindre la visibilité vos parties, mettez votre partie en privée à la création.",
  "Astuces : Rajouter des mots de 2 lettres tels que 'ne', 'ni', 'on' , 'je' , etc.",
  "Aide : Vos historiques de connexions et de déconnexions sont accessibles sur la page de profil.",
  "Le saviez-vous : Le Scrabble est considéré comme un sport mental et est joué en compétition à travers le monde.",
  "Astuces : Tentez des agencements de lettres si vous n'avez plus d'idée.",
];

@Component({
  selector: 'app-tips',
  templateUrl: './tips.component.html',
  styleUrls: ['./tips.component.scss']
})
export class TipsComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }

}
