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
  "Astuces : Passez votre tour en dernier recours,il est toujours mieux de placer une lettre.",
  "Aide : Vous pouvez modifier votre nom d'utilisateur sur la page de profil.",
  "Le saviez-vous : Les premiers sets de Scrabble fabriqués à la main coutaient 2,50 dollars chacun.",
  "Astuces : Lorsqu'il n'est pas possible de former un mot, échangez les lettres de votre chevalet.",
  "Aide : Déplacez sur l'écran l'icone de musique pour mieux voir le plateau de jeu.",
  "Le saviez-vous : Scrabble est dérivé de l'anglais et signifie 'gratter' ou 'creuser'. ",
  "Astuces : Apprendre des mots courts augmentera vos chances de placer des mots.",
  "Aide : Diminuez le son de la musique de fond pour vous concentrer.",
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
