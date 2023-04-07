import 'package:injectable/injectable.dart';

@injectable
class TranslateService {
  static final TranslateService _instance = TranslateService._internal();
  factory TranslateService() {
    return _instance;
  }

  TranslateService._internal();
  Map<String, String> translation = {
    //login_page
    'Connexion à votre compte': 'Login to your account',
    "Erreur lors de la connexion. Mauvais nom d'utilisateur et/ou mot de passe ou compte deja connecté. Veuillez recommencer":
        "Error while connecting. Wrong username and/or password or account already logged in. Please try again",
    "Nom d'utilisateur": "Username",
    "Mot de passe": "Password",
    "Connexion": "Login",
    "Nouveau? Créer votre compte": "Don't have an account? Create one",
    "Mot de passe oublié?": "Forgot password?",
    //sign_page
    "Votre compte a été créé avec succés":
        "Your account has been successfully created",
    "Erreur lors de la création du compte. Nom d'utilisateur deja utilisé. Veuillez recommencer.":
        "Error creating account. Username already in use. Please try again.",
    'Création de compte': "Account creation",
    "Nom d'utilisateur requis": "Username required",
    "Un nom d'utilisateur doit au moins contenir 5 caractéres.":
        "A username must contain at least 5 characters.",
    "Un nom d'utilisateur ne doit contenir que des lettres ou des chiffres":
        "A username must only contain letters or numbers",
    'Addresse email': "Email address",
    "Entrez une adresse email valide.": "Enter a valid email address.",
    "Mot de passe requis.": "Password required.",
    "Un mot de passe doit contenir au minimum 6 caractéres.":
        "A password must contain at least 6 characters.",
    "Retapez votre mot de passe": "Enter your password again",
    "Le mot de passe écrit ne correspond pas":
        "The entered password does not match",
    "Question de sécurité": "Security question",
    "Choisissez une question de sécurité": "Choose a security question",
    "Réponse à la question": "Answer to the question",
    "Entrez une réponse à la question de sécurité":
        "Enter an answer to the security question",
    "Créer le compte": "Create account",
    //game_modes_page
    "Application Scrabble": "Scrabble app",
    "Mode de jeu classique": "Classic game mode",
    "Mode de jeu coopératif": "Coop game mode",
    "Mode de jeu Classique": "Classic game mode",
    "Mode de jeu Coopératif": "Coop game mode",
    "Mode d'entrainement orthographe": "Spelling training mode",
    "Profil": "Profile",
    "Aide": "Help",
    "Déconnexion": "Log out",
    "Etes-vous sur de vous déconnecter ?": "Are you sure to log out?",
    "Oui": "Yes",
    "Non": "No",
    //channels_pages
    "General": "General",
    "Nouvelle discussion": "New discussion",
    "Conversations": "Chats",
    "Créer un chat": "Create a chat",
    "Supprimer un chat": "Delete a chat",
    "Rechercher un chat": "Search for a chat",
    "Créer un nouveau chat": "Create a new chat",
    "Nom du chat": "Chat name",
    "Annuler": "Cancel",
    "Créer le chat": "Create a chat",
    "Choisissez un chat à supprimer": "Choose a chat to delete",
    "Veuillez choisir le chat à supprimer": "Please choose the chat to delete",
    "Supprimer le chat": "Delete chat",
    "Rechercher": "Search",
    "Rejoindre le(s) chat(s)": "Join chats",

    //chat_page
    "Nouveau message dans": "New message in",
    "Plusieurs joueurs sont en train d'écrire ...":
        "Several players are writing...",
    "est en train d'écrire ...": "is typing...",
    'Bien joué!': "Well done!",
    'Wow!': "Wow!",
     'Nul!':"Nothing!",
    'Bonne chance!': "Good luck!",
    'Oh non!': "Oh no!",
    "Écris un message ...": "Write a message...",

    //gallery_page && camera_page
     "Page caméra":"Camera page",
     "Image en cours de traitement...": "Image being processed...",
    "Image trop volumineuse": "Image too large",
    "Page de choix d'icône": "Icon choice page",
    "Choississez une icône ou importer une image":
        "Choose an icon or import an image",

    //game_mode_choices
    "Francais": "French",
     "Classique": "Classic",
     "Coopératif": "Cooperative",
    "Mode de jeu Classique": "Classic Game mode",
    "Mode de jeu Coopératif": "Coop Game mode",
    "Créez ou rejoignez une partie en mode Classique": "Create or join a Classic game mode",
    "Créez ou rejoignez une partie en mode Coopératif": "Create or join a Coop game mode",
    "Créer une partie": "Create a game",
    "Rejoindre une partie": "Join a game",
    "Créez une partie publique ou privée": "Create a public or private game",
    "Partie privée": "Private game",
    "Nombres de joueurs humains": "Number of human players",
    "Nombre de joueurs humains requis.": "Number of human players required.",
    "Le nombre de joueurs humains minimum est de 2.":
        "The minimum number of human players is 2.",
    "Le nombre de joueurs humains maximum est de 4.":
        "The maximum number of human players is 4.",
    "Temps par tour (s)": "Time per lap (s)",
    "Temps": "Time",
    "Le temps minimum est 30 secondes.": "The minimum time is 30 seconds.",
    "Le temps maximum est de 300 secondes.": "The maximum time is 300 seconds.",
    "Dictionnaire de jeu": "Game dictionary",
    "Veillez choisir un dictionnaire": "Choose a dictionary",
    "Mot de passe de partie": "Game password",
    "Mot de passe de partie publique (optionnel)":
        "Public game password (optional)",
    "Créer la partie": "Create the game",

    //game_page
    "Abandonner la partie": "Quit game",
    "Voulez-vous abandonner la partie?": "Do you really want to give up?",
    "Erreur : les mots crées sont invalides":
        "Error: the created words are invalid",
    "Commande impossible a réaliser : le nombre de lettres dans la réserve est insuffisant":
        "The task can not be executed: the number of letters in the reserve is insufficient",
    'Page de jeu': "Game page",

    //home_page
    "Vous avez été déconnecté avec succés":
        "You have been successfully logged out",
    "Notifications": "Notifications",

     //MusicpopUp
     "Musique":'Music',
     "Lancer la liste de lecture": 'Start playlist',

    //join_game
    "Parties": "Games",
    "disponibles": "available",
    "Partie de": "Game of",
    "Publique (protégé par mot de passe)": "Public (secured with password)",
    "Publique": "Public",
    "Privée": "Private",
    "Réglages de la partie:": "Game settings",
    "Partie en cours:": "Game in progress:",
    "Salle d'attente:": "Waiting room",
    "Rejoindre": "Join",
    "Francais": "French",
    "Anglais": "English",
    "Observer": "Watch",
    "Mot de passe incorrect": "Incorrect password",
    "Ok": "Ok",
    "Attente d'acceptation": "Waiting for acceptance",
    "Vous êtes en attente d'être accepté par le hôte de la partie":
        "You are waiting to be accepted by the game host",
    "Vous avez été rejeté de la partie.":
        "You have been rejected from the game",

    //mode_orthographe
    "Bienvenue au mode entrainement orthographe": "Welcome to spelling mode",
    "Commencer l'entraînement": "Start training",
    "Votre meilleur score": "Your best score",
    "Quitter": "Quit",
    "Désolé, vous avez perdu !": "Sorry, you lost!",
    "Bien joué, vous avez fini le mode d'entraînement orthographe !":
        "Well done, you've finished spelling mode!",

    //password_recovering_page
    "Ce nom d'utilisateur n'existe pas": "This username does not exist",
    "Modification du mot de passe non-autorisée":
        "Unauthorized password change",
    "Retour": "Back",
    "Récupération de compte": "Account recovery",
    "Entrez votre nom d'utilisateur": "Enter your username",
    "Nom d'utilisateur requis.": "Username required",
    "Vérifier l'identifiant": "Check user",
    "Nouveau mot de passe": "New password",
    "Réponse incorrecte, veuillez réessayer":
        "Incorrect answer, please try again",
    "Valider les modifications": "Approve changes",
    "Lettre à échanger": "Letter to exchange",
    "Ce username est deja utilisé !": "This username is already in use!",
    "Veuillez entrer un nouvel utilisateur ou avatar":
        "Please enter a new user or avatar",
    "Modification du compte": "Edit account",

    //user_account_edit_page
    "Le nom utilisateur est incorrect": "The username is incorrect",
    "Nouveau nom d'utilisateur": "New username",

    //user_account_page
    "Mon compte": "My account",
    "Dernière connexion": "Last connection",
    "Points": "Points",
    "Historique des connexions": "Login history",
    "Historique des déconnexions": "Log out history",
     "Temps moyen par partie": "Average time per game",
     "Moyenne de points par partie": "Average points per game",
     'Parties perdues':"Lost games",
     'Parties gagnées':"Games won",
     'Parties jouées':"Games played",

    //waiting_room
    "Salle d'attente de": "Waiting room of",
    "Joueurs": "Players",
    "Observateurs": "Viewers",
    "En attente de joueurs": "Waiting for players",
    "Joueurs restants pour démarrer la partie:":
        "Players left to start the game:",
    "Lancer Partie": "Start game",
    "Annuler Partie": "Cancel game",
    "Demande d'acceptation": "Approval request",
    "essaye de rejoindre la partie. Accepter ou rejeter le joueur?":
        "try to join the game. Accept or reject player?",
    "Rejeter": "Reject",
    "Accepter": "Accept",
    "a quitté l'attente d'acceptation.": "has left waiting for approval.",
  };
  translateService() {
    ;
  }

  translateString(String language, String stringToTranslate) {
    if (language == 'fr') {
      return stringToTranslate;
    } else if (language == 'en') {
      return translation[stringToTranslate];
    }
    return stringToTranslate;
  }
}
