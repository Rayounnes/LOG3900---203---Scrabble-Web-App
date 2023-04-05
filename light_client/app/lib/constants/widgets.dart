const TOP_BOARD_POSITION = 255.0;
const BOTTOM_BOARD_POSITION = 975.0;
const LEFT_BOARD_POSITION = 25.0;
const RIGHT_BOARD_POSITION = 775.0;

const TILE_SIZE = 50.0;
const TILE_ADJUSTMENT = 80.0;
const NB_OF_TILE = 15;
const PLAYER_INITIAL_ID = [0, 1, 2, 3, 4, 5, 6];
const OPPONENT_INITIAL_ID = [3000, 3001, 3002, 3003, 3004, 3005, 3006];

const RACK_START_AXISX = 225.0;
const RACK_START_AXISY = 1055.0;
const RACK_SIZE = 7;

const MUSIC_PATH = [
  'assets/Wii Music.mp3',
  'assets/CSM Music.mp3',
  'assets/Elevator Music.mp3',
  'assets/OnePiece Music.mp3',
  'assets/Sneaky Music.mp3',
  'assets/Fumetsu Music.mp3',
  'assets/AOT Music.mp3',
];

// SOUND_EFFECTS
const GOOD_PLACEMENT_SOUND = 'assets/Mario Coin.mp3';
const BAD_PLACEMENT_SOUND = 'assets/Fail.mp3';
const LOSE_GAME_SOUND = 'assets/Mario Fall.mp3';
const SWITCH_TURN_SOUND = 'assets/Me Mario.mp3';
const CHANGE_TILE_SOUND = 'assets/Yay.mp3';
const WIN_GAME_SOUND = 'assets/Pokemon win.mp3';

const BASE64PREFIX = 'data:image/png;base64,';

const SECURITY_QUESTIONS = [
  "Quel est votre destination de rêve ?",
  "Quel est votre nourriture préféré ?",
  "Quel est votre animal préféré ?",
  "Quel est votre sport préféré ?",
  "Quel est votre langage de programmation préféré ?",
];

// LOADING_SCREEN_TIPS
const TIPS_FR = [
  "Astuces : Passez votre tour en dernier recours,\nil est toujours mieux de placer une lettre.",
  "Aide : Vous pouvez modifier votre nom d'utilisateur sur la page de profil.",
  "Le saviez-vous : Les premiers sets de Scrabble\n fabriqués à la main coutaient 2,50 dollars chacun.",
  "Astuces : Lorsqu'il n'est pas possible de former\n un mot, échangez les lettres de votre chevalet.",
  "Aide : Déplacez sur l'écran l'icone de musique pour mieux voir le plateau de jeu.",
  "Le saviez-vous : Scrabble est dérivé de l'anglais et signifie 'gratter' ou 'creuser'.",
  "Astuces : Apprendre des mots courts augmentera\n vos chances de placer des mots.",
  "Aide : Diminuez le son de la musique de fond pour vous concentrer.",
  "Le saviez-vous : Le Scrabble a été créé en 1938\n par l'architecte américain Alfred Mosher Butts.",
  "Astuces : Essayer de mettre des mots au pluriel pour maximiser les points.",
  "Aide : Le mode Orthographe est un bon moyen\n de se pratiquer et d'améliorer son vocabulaire.",
  "Le saviez-vous : Un championnat national de Scrabble\n aux États-Unis a rassemblé en août 2021 plus de 300 joueurs.",
  "Astuces : Les mots longs ont souvent une valeur\n élevée et peuvent rapporter beaucoup de points.",
  "Le saviez-vous : La FISF est l'acronyme pour\n Fédération Internationale de Scrabble Francophone.",
  "Aide : Sur la page d'accueil, cliquez le bouton profil pour voir vos informations.",
  "Le saviez-vous : En 2020, la FISF a ajouté 3000 nouveaux mots dans sa liste officielle.",
  "Astuces : Utilisez les cases bonus (x2, x3, ...) pour maximiser vos points.",
  "Aide : Il est possible d'observer une partie en cours,\n(Ex: mode classique --> rejoindre une partie --> observer).",
  "Le saviez-vous : Les lettres du jeu sont réparties en fonction\n de leur fréquence d'utilisation en fonction de la langue.",
  "Astuces : Planifiez votre prochain coup en avance\n en évaluant les combinaisons possibles.",
  "Aide : N'hésitez pas à changer votre avatar, cela est possible sur la page de profil.",
  "Le saviez-vous : Le mot qui peut donner le plus grand\n nombre de point est 'oxyphenbutazone'.",
  "Aide : Si vous oubliez votre mot de passe, cliquez sur mot de passe oublié.",
  "Astuces : Bloquez les espaces pour empêcher\n votre adversaire de marquer des points.",
  "Le saviez-vous : Le Scrabble est disponible dans plus de\n 120 pays et est disponible en 29 langues différentes.",
  "Aide : Pour restreindre la visibilité vos parties,\n mettez votre partie en privée à la création.",
  "Astuces : Rajouter des mots de 2 lettres tels que 'ne', 'ni', 'on' , 'je' , etc.",
  "Aide : Vos historiques de connexions et de déconnexions\n sont accessibles sur la page de profil.",
  "Le saviez-vous : Le Scrabble est considéré comme un sport mental\n et est joué en compétition à travers le monde.",
  "Astuces : Tentez des agencements de lettres si vous n'avez plus d'idée.",
];

// Section Aide
const TOPICS_NAME = [
  'Mode Classique',
  'Mode Coopératif',
  'Mode Orthographe',
  'Compte Utilisateur',
  'Outils Bonus',
];

const CLASSIC_MODE_HELP_IMAGE = [
  'assets/images/Classic/ClassicMode.png',
  'assets/images/Classic/Create.png',
  'assets/images/Classic/PrivateOrPublic.png',
  'assets/images/Classic/Join.png',
  'assets/images/Classic/WaitingRoom.png',
  'assets/images/Classic/Accept.png',
  'assets/images/Classic/Pass.png',
  'assets/images/Classic/Exchange.png',
  'assets/images/Classic/Placement.png',
  'assets/images/Classic/Validate.png',
];

const CLASSIC_MODE_HELP_TEXT = ["Le mode classique est un mode de jeu dans lequel 4 adversaires s'affrontent."
    "\nIl faut au minimum de 2 joueurs humains."
    "\nUne limite de temps est accordé à chaque tour pour faire un placement.",
  "Pour créer une partie selon vos préférences, cliquer sur le bouton 'Créer une Partie'.",
  "Vous avez la possibilité de rendre vos parties privées\net de choisir le temps de chaque tour.",
  "Pour rejoindre une partie, cliquer sur le bouton 'Rejoindre une partie'.",
  "Ceci est la salle d'attente avant de rejoindre une partie.\nLes informations de la partie y sont présentées.",
  "Le créateur d'une partie peut décider de commencer la partie ou de l'annuler.",
  "Ce bouton permet de passer son tour.",
  "Ce bouton permet de d'échanger les lettres du chevalet.",
  "Pour faire un placement, il faut placer les lettres dans un sens de lecture\ndu haut vers le bas ou de la gauche vers la droite.",
  "Ce bouton permet de valider le placement des lettres sur le plateau.",
];


const COOP_MODE_HELP_IMAGE = [
  'assets/images/Coop/CoopMode.png',
  'assets/images/Coop/Placement.png',
  'assets/images/Coop/Accept.png',
];

const COOP_MODE_HELP_TEXT = ["Le mode coopératif est un mode de jeu dans lequel tous les joueurs"
    "\ncoopèrent pour remplir le plateau de lettres."
    "\nLe minimum de joueurs est de 2 et le maximum est de 4."
    "\nLes joueurs partagent le même chevalet, donc ils doivent s'entendre pour les placements."
    "\nIl n'y a pas de limite de temps ni de joueurs virtuels.",
  "Lorsqu'un joueur fait un placement, il sera en attente"
      "\nde la validation de ses coéquipiers.",
  "Lorsqu'un coéquipier fait un placement, vous pouvez accepter ou refuser."
];

const TRAINING_MODE_HELP_IMAGE = [
  'assets/images/Training/Orthographe.png',
  'assets/images/Training/Choice.png',
];

const TRAINING_MODE_HELP_TEXT = ["Le mode orthographe est un mode pour pratiquer son orthographe."
    "\nCe mode n'affectera pas vos points d'expérience.",
  "Le but est de choisir les bons mots jusqu'à ce qu'il n'y en ai plus."
      "\nVous avez le droit à 3 chances. Si vous faites 3 erreurs, vous perdez."
];

const PROFILE_HELP_IMAGE = [
  'assets/images/Profile/Profil.png',
  'assets/images/Profile/History.png',
  'assets/images/Profile/Stats.png',
  'assets/images/Profile/Edit1.png',
  'assets/images/Profile/Edit2.png',
  'assets/images/Profile/Username.png',
  'assets/images/Profile/Avatar.png'
];

const PROFILE_HELP_TEXT = ["La page de profil est la page pour modifier "
    "\nou consulter les informations de l'utilisateur.",
  "En cliquant sur cet icone, l'utilisateur accède à son historique"
    "\nde connexions et de déconnexions de l'application.",
  "En cliquant sur cet icone, l'utilisateur accède à ses statistiques,"
      "\ntel que son nombre de victoires et ses parties jouées.",
  "En cliquant sur cet icone, l'utilisateur est dirigé vers une page"
      "\npour modifier ses informations.",
  "L'utilisateur peut modifier son avatar et/ou son pseudonyme."
      "\nLe nom d'utilisateur actuel est requis pour valider toute modification.",
  "Voici un exemple de modification du nom d'utilisateur.",
  "Voici un exemple de modification de l'avatar."
];

const BONUS_HELP_IMAGE = [
  'assets/images/Bonus/Music.png',
  'assets/images/Bonus/Astuces.png',
];

const BONUS_HELP_TEXT = [
  "Cet icone de musique peut être déplacé sur l'écran."
      "\nEn cliquant dessus vous pouvez changer la musique et modifier le son.",
  "Ces phrases se trouvant au bas de la page d'accueil et dans les salles d'attente"
      "\nde parties sont des informations divisés en 3 types.Il y a des astuces de jeu,"
      "\ndes anecdotes et des informations pour faciliter l'utilisation de l'application"
];


