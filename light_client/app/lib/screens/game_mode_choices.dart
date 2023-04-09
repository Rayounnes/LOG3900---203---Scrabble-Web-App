import 'package:app/constants/constants.dart';
import 'package:app/models/game.dart';
import 'package:app/screens/join_game.dart';
import 'package:app/screens/waiting_room.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/services/translate_service.dart';
import 'package:app/widgets/button.dart';
import 'package:app/widgets/parent_widget.dart';
import 'package:flutter/material.dart';
import 'package:app/main.dart';
import 'package:app/services/user_infos.dart';

import '../models/personnalisation.dart';

class GameChoices extends StatefulWidget {
  final String modeName;
  const GameChoices({super.key, required this.modeName});

  @override
  State<GameChoices> createState() => _GameChoicesState();
}

class _GameChoicesState extends State<GameChoices> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final timeController = TextEditingController(text: "60");
  // final humanPlayersController = TextEditingController(text: "2");
  final passwordGameController = TextEditingController();
  String lang = "en";
  TranslateService translate = new TranslateService();
  String theme = "white";

  bool isClassicMode = false;
  Game game = Game(
      hostUsername: getIt<UserInfos>().user,
      hasStarted: false,
      isPrivate: false,
      isFullPlayers: false,
      isFinished: false,
      password: '',
      humanPlayers: 2,
      observers: 0,
      virtualPlayers: 0,
      playersWaiting: 0,
      time: 60,
      dictionary: FRENCH_DICTIONNARY);

  String dictionary = "Francais";
  List<DropdownMenuItem<String>> dictionnaries = [
    DropdownMenuItem(child: Text("Francais"), value: "Francais"),
    DropdownMenuItem(child: Text("English"), value: "Anglais"),
  ];

  @override
  void initState() {
    super.initState();
    handleSockets();
    getConfigs();
    isClassicMode = widget.modeName == GameNames.classic;
  }

  getConfigs() {
    getIt<SocketService>().send("get-config");
  }

  @override
  void dispose() {
    timeController.dispose();
    // humanPlayersController.dispose();
    passwordGameController.dispose();
    super.dispose();
  }

  void handleSockets() {
    getIt<SocketService>().on("get-config", (value) {
      lang = value['langue'];
      theme = value['theme'];
      if (mounted) {
        setState(() {
          lang = value['langue'];
          theme = value['theme'];
        });
      }
    });
  }

  createGame(bool isPrivateGame) {
    if (!_formKey.currentState!.validate()) return;
    game.time = int.parse(timeController.text);
    game.isPrivate = isPrivateGame;
    game.isClassicMode = isClassicMode;
    // game.humanPlayers = int.parse(humanPlayersController.text);
    game.password = passwordGameController.text;
    game.dictionary =
        dictionary == "Francais" ? FRENCH_DICTIONNARY : ENGLISH_DICTIONNARY;
    game.joinedPlayers = [];
    game.joinedObservers = [];
    game.virtualPlayers = 3;
    Navigator.of(context).pop();
    Navigator.push(context, MaterialPageRoute(builder: (context) {
      return WaitingRoom(
        modeName: widget.modeName,
        waitingSocket: () {
          getIt<SocketService>().send('create-game', game);
        },
      );
    }));
  }

  @override
  Widget build(BuildContext context) {
    return ParentWidget(
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            translate.translateString(lang, "Mode de jeu ${widget.modeName}"),
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
          ),
        ),
        backgroundColor: theme == "dark"
            ? Colors.green[800]
            : Color.fromARGB(255, 207, 241, 207),
        body: Center(
          child: Container(
            height: 400,
            width: 500,
            decoration: BoxDecoration(
              color: theme == "dark"
                  ? Color.fromARGB(255, 203, 201, 201)
                  : Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                width: 1,
                color: Colors.grey,
              ),
            ),
            child: Column(
              children: <Widget>[
                Text(
                  translate.translateString(
                      lang, "Mode de jeu ${widget.modeName}"),
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                      translate.translateString(
                              lang, 'Créez ou rejoignez une partie') +
                          widget.modeName,
                      style: TextStyle(
                        fontSize: 23,
                        color: Colors.black,
                      )),
                ),
                SizedBox(height: 15.0),
                GameButton(
                    theme: theme,
                    padding: 25.0,
                    name: translate.translateString(lang, "Créer une partie"),
                    route: () {
                      showModal(context);
                    }),
                GameButton(
                    theme: theme,
                    padding: 32.0,
                    name:
                        translate.translateString(lang, "Rejoindre une partie"),
                    route: () {
                      Navigator.push(context,
                          MaterialPageRoute(builder: (context) {
                        return JoinGames(
                          modeName: widget.modeName,
                        );
                      }));
                    }),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void showModal(BuildContext context) {
    showDialog(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          bool _isChecked = false;
          return StatefulBuilder(builder: (context, setState) {
            return AlertDialog(
              title: Text(translate.translateString(lang, 'Créer une partie') +
                  " " +
                  translate.translateString(lang, widget.modeName)),
              content: Container(
                width: 500,
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Text(translate.translateString(
                          lang, "Créez une partie publique ou privée")),
                      CheckboxListTile(
                        title: Text(
                            translate.translateString(lang, 'Partie privée')),
                        value: _isChecked,
                        onChanged: (newValue) {
                          setState(() {
                            _isChecked = newValue!;
                          });
                        },
                        controlAffinity: ListTileControlAffinity.leading,
                      ),
                      if (isClassicMode)
                        Container(
                          padding: const EdgeInsets.all(8.0),
                          child: TextFormField(
                            controller: timeController,
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(
                                border: OutlineInputBorder(),
                                hintText: translate.translateString(
                                    lang, 'Temps par tour (s)'),
                                labelText:
                                    translate.translateString(lang, 'Temps')),
                            validator: (String? value) {
                              if (value == null || value.isEmpty) {
                                return translate.translateString(
                                    lang, "Temps par tour requis.");
                              } else if (int.parse(value) < MIN_TIME_TURN) {
                                return translate.translateString(
                                    lang, "Le temps minimum est 30 secondes.");
                              } else if (int.parse(value) > MAX_TIME_TURN) {
                                return translate.translateString(lang,
                                    "Le temps maximum est de 300 secondes.");
                              }
                              return null;
                            },
                          ),
                        ),
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Text(
                          translate.translateString(
                              lang, "Dictionnaire de jeu"),
                        ),
                      ),
                      DropdownButtonFormField(
                          validator: (value) => value == null
                              ? translate.translateString(
                                  lang, "Veillez choisir un dictionnaire")
                              : null,
                          value: dictionary,
                          onChanged: (String? newValue) {
                            setState(() {
                              dictionary = newValue!;
                            });
                          },
                          items: dictionnaries),
                      if (!_isChecked)
                        Container(
                          padding: const EdgeInsets.all(16.0),
                          child: TextFormField(
                            controller: passwordGameController,
                            obscureText: true,
                            decoration: InputDecoration(
                                border: OutlineInputBorder(),
                                hintText: translate.translateString(
                                    lang, 'Mot de passe de partie'),
                                labelText: translate.translateString(lang,
                                    'Mot de passe de partie publique (optionnel)')),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              actions: <ElevatedButton>[
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text(
                    translate.translateString(lang, "Annuler"),
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    createGame(_isChecked);
                  },
                  child: Text(
                    translate.translateString(lang, "Créer la partie"),
                  ),
                )
              ],
            );
          });
        });
  }
}
