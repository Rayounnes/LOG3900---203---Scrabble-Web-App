import { Point } from '@app/interfaces/point';
import { TopScore } from '@app/interfaces/top-scores';

const ZERO_POINT = 0;
const ONE_POINT = 1;
const TWO_POINTS = 2;
const THREE_POINTS = 3;
const FOUR_POINTS = 4;
const EIGHT_POINTS = 8;
const TEN_POINTS = 10;
export const LETTERS_POINTS = new Map<string, number>();
LETTERS_POINTS.set('a', ONE_POINT);
LETTERS_POINTS.set('b', THREE_POINTS);
LETTERS_POINTS.set('c', THREE_POINTS);
LETTERS_POINTS.set('d', TWO_POINTS);
LETTERS_POINTS.set('e', ONE_POINT);
LETTERS_POINTS.set('f', FOUR_POINTS);
LETTERS_POINTS.set('g', TWO_POINTS);
LETTERS_POINTS.set('h', FOUR_POINTS);
LETTERS_POINTS.set('i', ONE_POINT);
LETTERS_POINTS.set('j', EIGHT_POINTS);
LETTERS_POINTS.set('k', TEN_POINTS);
LETTERS_POINTS.set('l', ONE_POINT);
LETTERS_POINTS.set('m', TWO_POINTS);
LETTERS_POINTS.set('n', ONE_POINT);
LETTERS_POINTS.set('o', ONE_POINT);
LETTERS_POINTS.set('p', THREE_POINTS);
LETTERS_POINTS.set('q', EIGHT_POINTS);
LETTERS_POINTS.set('r', ONE_POINT);
LETTERS_POINTS.set('s', ONE_POINT);
LETTERS_POINTS.set('t', ONE_POINT);
LETTERS_POINTS.set('u', ONE_POINT);
LETTERS_POINTS.set('v', FOUR_POINTS);
LETTERS_POINTS.set('w', TEN_POINTS);
LETTERS_POINTS.set('x', TEN_POINTS);
LETTERS_POINTS.set('y', TEN_POINTS);
LETTERS_POINTS.set('z', TEN_POINTS);
LETTERS_POINTS.set('*', ZERO_POINT);
export const INVALID_CHARACTERS: string[] = ['-', "'", '`'];
export const COLUMNS_LETTERS = 'abcdefghijklmno';
export const BONUS_POINT = 50;

export const START_INDEX_BOARD = 0;
export const HALF_INDEX_BOARD = 7;
export const INDEX_TWELVE = 12;
export const INDEX_THIRTEEN = 13;
export const INDEX_EIGHT = 8;
export const INDEX_FOUR = 4;
export const INDEX_SIX = 6;
export const END_INDEX_BOARD = 14;
export const END_COLUMN_BOARD = 15;
export const MAX_LETTERS = 7;
export const HORIZONTAL = 'h';
export const VERTICAL = 'v';
export const DIRECTIONS = [HORIZONTAL, VERTICAL];
export const DOUBLE_LETTER_POSITIONS: Point[] = [
    { x: 2, y: 6 },
    { x: 2, y: 8 },
    { x: 6, y: 6 },
    { x: 6, y: 8 },
    { x: 6, y: 12 },
    { x: 8, y: 8 },
    { x: 8, y: 12 },
];
/* des constantes utilises pour le BestScoresService */

export const DATABASE_URL = 'mongodb+srv://projet3:admin123@cluster1.9gz1fcx.mongodb.net/?retryWrites=true&w=majority';



export const DATABASE_NAME = 'GeneralDB';
export const DB_COLLECTION_CLASSIQUE = 'BESTSCORESCLASSIC';
export const DB_COLLECTION_USERS = 'Users'
export const DB_COLLECTION_LOG2990 = 'BESTSCORESLOG2990';
export const DB_COLLECTION_CHANNEL = 'Channels'
export const DB_COLLECTION_GAME_HISTORY = 'GAMEHISTORY';
export const DB_COLLECTION_WORDS = 'WordsOrthography';
export const DB_COLLECTION_SCORESORTHOGRAPHY = 'ScoresOrthography'
export const DB_COLLECTION_ICONS = 'avatars';
export const DB_COLLECTION_SECURITY_QST = 'SecurityQuestions';
export const TOP_FIVE_SCORES = 5;
export const DESCENDING_ORDER = -1;

export const HTTP_STATUS_OK = 200;
export const HTTP_STATUS = 203;
export const HTTP_STATUS_CREATED = 201;
export const HTTP_STATUS_ACCEPTED = 202;
export const HTTP_STATUS_SERVER_ERROR = 500;
export const HTTP_STATUS_NOT_FOUND = 404;
export const HTTP_STATUS_NO_CONTENT = 204;
export const HTTP_STATUS_NOT_ACCEPTABLE = 406;
export const HTTP_STATUS_UNAUTHORIZED = 401;

export const MAX_HINT_LENGTH = 5;
export const VOWELS: string[] = ['a', 'e', 'i', 'o', 'u', 'y'];
export const ALPHABET: string[] = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
];
export const COMMAND_DESCRIPTION: string[] = [
    '!placer: Permet de placer des lettres sur le plateau de jeu pour former des mots.',
    "!échanger: Permet d'échanger des lettres de votre chevalet avec des lettres choisies au hasard dans la réserve.",
    '!passer: Permet de sauter votre tour.',
    "!indice: Permet d'obtenir trois possibilités de placement, mais pas nécéssairement celles qui offrent le plus de point.",
    "!réserve: Permet d'obtenir le contenu de la réserve à jour et en ordre alphabétique.",
    "!aide: Permet d'obtenir une description des commandes disponibles.",
];
export const PLACE_PROB = 0.8;
export const EXCHANGE_PASS_PROB = 0.1;
export const SIX_POINTS_LESS_PROB = 0.4;
export const SEVEN_TWELVE_POINTS_PROB = 0.3;
export const THIRTEEN_EIGHTTEEN_POINTS_PROB = 0.3;
export enum COMMANDS {
    Placer = 'placer',
    Échanger = 'échanger',
    Passer = 'passer',
}
export enum POINTS {
    SixOrLess = 6,
    SevenToTwelve = 12,
    ThirteenToEighteen = 18,
}
export enum LEVEL {
    Beginner = 'Débutant',
    Expert = 'Expert',
}
export enum VPlayerLevel {
    Expert = 'expert',
    Beginner = 'beginner',
}
export const BEGINNER_VIRTUAL_PLAYERS = [{ name: 'Marc' }, { name: 'Jean' }, { name: 'Ben' }];
export const EXPERT_VIRTUAL_PLAYERS = [{ name: 'Ronaldo' }, { name: 'Messi' }, { name: 'Mahrez' }];
export const BEGINNER_VIRTUAL_PLAYERS_NAMES = ['Marc', 'Ben', 'Jean'];
export const EXPERT_VIRTUAL_PLAYERS_NAMES = ['Ronaldo', 'Messi', 'Mahrez'];
export const SCORES_LOG: TopScore[] = [
    {
        playerName: 'Patric',
        score: 59,
    },
    {
        playerName: 'Laurent',
        score: 124,
    },
    {
        playerName: 'Ipsum',
        score: 253,
    },
    {
        playerName: 'Amine',
        score: 298,
    },
    {
        playerName: 'Pascal',
        score: 45,
    },
];
export const SCORES_CLASSIC: TopScore[] = [
    {
        playerName: 'Lorem',
        score: 80,
    },
    {
        playerName: 'Walid',
        score: 92,
    },
    {
        playerName: 'Jean',
        score: 128,
    },
    {
        playerName: 'Benjamin',
        score: 234,
    },
    {
        playerName: 'Mathieu',
        score: 359,
    },
];

export interface loginInfos {
    username : string,
    password : string,
    email? : string,
    icon? : string,
    socket? : string,
    qstIndex? : string,
    qstAnswer? : string,
}
