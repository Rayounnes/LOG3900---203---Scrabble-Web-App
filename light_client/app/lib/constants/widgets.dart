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

const SECURITY_QUESTIONS_FR = [
  "Quel est votre destination de rêve ?",
  "Quel est votre nourriture préféré ?",
  "Quel est votre animal préféré ?",
  "Quel est votre sport préféré ?",
  "Quel est votre langage de programmation préféré ?",
];
const SECURITY_QUESTIONS_EN = [
  "What is your dream destination?",
  "What is your favorite food?",
  "What is your favorite animal?",
  "What is your favorite sport?",
  "What is your favorite programming language?",
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
  [
  'Mode Classique',
  'Mode Coopératif',
  'Mode Orthographe',
  'Compte Utilisateur',
  'Outils Bonus',
  ],
  [
    'Classic Mode',
    'Cooperative Mode',
    'Spelling Mode',
    'User Account',
    'Bonus Tools',
  ]
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

const CLASSIC_MODE_HELP_TEXT = [
  ["Le mode classique est un mode de jeu dans lequel 4 adversaires s'affrontent."
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
  ],
  [
  "Classic mode is a game mode in which 4 opponents compete."
    "\nA minimum of 2 human players are required."
    "\nA time limit is granted for each turn to make a placement.",
  "To create a game according to your preferences, click on the 'Create a Game' button.",
  "You have the option of making your games private\nand choosing the time for each turn.",
  "To join a game, click on the 'Join a Game' button.",
  "This is the waiting room before joining a game.\nThe game information is presented there.",
  "The creator of a game can decide to start the game or cancel it.",
  "This button allows you to pass your turn.",
  "This button allows you to exchange letters from your rack.",
  "To make a placement, letters must be placed in a reading direction\nfrom top to bottom or from left to right.",
  "This button allows you to validate the placement of letters on the board.",
  ]
];


const COOP_MODE_HELP_IMAGE = [
  'assets/images/Coop/CoopMode.png',
  'assets/images/Coop/Placement.png',
  'assets/images/Coop/Accept.png',
];

const COOP_MODE_HELP_TEXT = [
  ["Le mode coopératif est un mode de jeu dans lequel tous les joueurs"
    "\ncoopèrent pour remplir le plateau de lettres."
    "\nLe minimum de joueurs est de 2 et le maximum est de 4."
    "\nLes joueurs partagent le même chevalet, donc ils doivent s'entendre pour les placements."
    "\nIl n'y a pas de limite de temps ni de joueurs virtuels.",
  "Lorsqu'un joueur fait un placement, il sera en attente"
      "\nde la validation de ses coéquipiers.",
  "Lorsqu'un coéquipier fait un placement, vous pouvez accepter ou refuser."
  ],
  [
    "Cooperative mode is a game mode in which all players"
     "\nwork together to fill the board with letters."
      "\nThe minimum number of players is 2 and the maximum is 4."
      "\nThe players share the same rack, so they must agree on the placements."
      "\nThere is no time limit or virtual players.",
    "When a player makes a placement, they will be waiting",
    "\nfor validation from their teammates.",
    "When a teammate makes a placement, you can accept or refuse it."
  ]
];

const TRAINING_MODE_HELP_IMAGE = [
  'assets/images/Training/Orthographe.png',
  'assets/images/Training/Choice.png',
];

const TRAINING_MODE_HELP_TEXT = [
  ["Le mode orthographe est un mode pour pratiquer son orthographe."
    "\nCe mode n'affectera pas vos points d'expérience.",
  "Le but est de choisir les bons mots jusqu'à ce qu'il n'y en ai plus."
      "\nVous avez le droit à 3 chances. Si vous faites 3 erreurs, vous perdez."
  ],
  [
    "Spelling mode is a mode to practice your spelling."
    "\nThis mode will not affect your experience points.",
    "The goal is to choose the correct words until there are none left."
    "\nYou have 3 chances. If you make 3 mistakes, you lose."
  ]
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

const PROFILE_HELP_TEXT = [
  ["La page de profil est la page pour modifier "
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
  ],
  [
    "The profile page is the page to modify"
    "\nor view user's information.",
    "By clicking on this icon, the user accesses their"
    "\napplication login and logout history.",
    "By clicking on this icon, the user accesses their statistics,"
    "\nsuch as their number of wins and games played.",
    "By clicking on this icon, the user is directed to a page"
    "\nto modify their information.",
    "The user can modify their avatar and/or username."
    "\nThe current username is required to validate any modification.",
    "Here is an example of modifying the username.",
    "Here is an example of modifying the avatar."
  ]
];

const BONUS_HELP_IMAGE = [
  'assets/images/Bonus/Music.png',
  'assets/images/Bonus/Astuces.png',
];

const BONUS_HELP_TEXT = [
  [
  "Cet icone de musique peut être déplacé sur l'écran."
      "\nEn cliquant dessus vous pouvez changer la musique et modifier le son.",
  "Ces phrases se trouvant au bas de la page d'accueil et dans les salles d'attente"
      "\nde parties sont des informations divisés en 3 types.Il y a des astuces de jeu,"
      "\ndes anecdotes et des informations pour faciliter l'utilisation de l'application"
  ],
  [
    "This music icon can be moved on the screen.\nBy clicking on it, you can change the music and adjust the sound.",
    "These sentences at the bottom of the homepage and in the waiting rooms"
        "\nof the games are information divided into 3 types. There are game tips, anecdotes,"
        "\nand information to facilitate the use of the application."
  ]
];


const TIPS_EN = [
  "Tips: Skip your turn as a last resort, it is always better to place a letter.",
  "Help: You can change your username on the profile page.",
  "Did you know: The first handmade Scrabble sets cost 2,50 dollars each.",
  "Tips: When it is not possible to form a word, exchange the letters of your rack.",
  "Help: Move the music icon to the screen to better see the game board.",
  "Did you know: Scrabble is derived from English and means 'to scratch' or 'to dig'."
  "Tips: Learning short words will increase your chances of placing words.",
  "Help: Decrease the sound of background music to concentrate.",
  "Did you know: Scrabble was created in 1938 by American architect Alfred Mosher Butts.",
  "Tips: Try to put words in the plural to maximize points.",
  "Help: Spelling mode is a good way to practice and improve vocabulary.",
  "Did you know: A national Scrabble championship in the United States gathered more than 300 players in August 2021.",
  "Tips: Long words often have a high value and can earn a lot of points.",
  "Did you know: FISF is the acronym for Fédération Internationale de Scrabble Francophone.",
  "Help: On the home page, click the profile button to see your information.",
  "Did you know: In 2020, the FISF added 3,000 new words to its official list",
  "Tips: Use bonus boxes (x2, x3, ...) to maximize your points.",
  "Help: It is possible to observe a game in progress, (Ex: classic mode --> join a game --> observe).",
  "Did you know: The letters of the game are distributed according to their frequency of use according to the language.",
  "Tips: Plan your next move in advance by evaluating possible combinations.",
  "Help: Feel free to change your avatar, this is possible on the profile page.",
  "Did you know: The word that can give the highest number of points is 'oxyphenbutazone'.",
  "Help: If you forget your password, click Forgot password.",
  "Tips: Block spaces to prevent your opponent from scoring points.",
  "Did you know: Scrabble is available in more than 120 countries and is available in 29 different languages.",
  "Help: To restrict the visibility of your games, put your game in private at creation.",
  "Help: Your login and logout histories are accessible on the profile page.",
  "Did you know: Scrabble is considered a mental sport and is played competitively around the world.",
  "Tips: Try letter layouts if you run out of ideas.",
  "Tips: Add 2-letter words such as 'ne', 'ni', 'on', 'I', etc.",
];
