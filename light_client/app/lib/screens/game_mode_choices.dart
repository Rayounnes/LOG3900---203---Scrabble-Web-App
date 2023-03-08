import 'package:app/constants/constants.dart';
import 'package:app/models/game.dart';
import 'package:app/screens/join_game.dart';
import 'package:app/screens/waiting_room.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/widgets/button.dart';
import 'package:app/widgets/parent_widget.dart';
import 'package:flutter/material.dart';
import 'package:app/main.dart';
import 'package:app/services/user_infos.dart';

class GameChoices extends StatefulWidget {
  final String modeName;
  const GameChoices({super.key, required this.modeName});

  @override
  State<GameChoices> createState() => _GameChoicesState();
}

class _GameChoicesState extends State<GameChoices> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final timeController = TextEditingController(text: "60");
  final humanPlayersController = TextEditingController(text: "2");
  final passwordGameController = TextEditingController();
  bool isClassicMode = false;
  Game game = Game(
      hostUsername: getIt<UserInfos>().user,
      hasStarted: false,
      isPrivate: false,
      isFullPlayers: false,
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
    DropdownMenuItem(child: Text("Anglais"), value: "Anglais"),
  ];

  @override
  void initState() {
    super.initState();
    isClassicMode = widget.modeName == GameNames.classic;
  }

  @override
  void dispose() {
    timeController.dispose();
    super.dispose();
  }

  createGame(bool isPrivateGame) {
    if (!_formKey.currentState!.validate()) return;
    game.time = int.parse(timeController.text);
    game.isPrivate = isPrivateGame;
    game.isClassicMode = isClassicMode;
    game.humanPlayers = int.parse(humanPlayersController.text);
    game.password = passwordGameController.text;
    game.dictionary =
        dictionary == "Francais" ? FRENCH_DICTIONNARY : ENGLISH_DICTIONNARY;
    game.joinedPlayers = [];
    game.joinedObservers = [];
    game.virtualPlayers = 4 - game.humanPlayers;
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
            "Mode de jeu ${widget.modeName}",
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
          ),
        ),
        backgroundColor: Colors.green[800],
        body: Center(
          child: Container(
            height: 400,
            width: 500,
            decoration: BoxDecoration(
              color: Color.fromRGBO(203, 201, 201, 1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                width: 1,
                color: Colors.grey,
              ),
            ),
            child: Column(
              children: <Widget>[
                Text(
                  "Mode de jeu ${widget.modeName}",
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child:
                      Text('Créez ou rejoignez une partie ${widget.modeName}',
                          style: TextStyle(
                            fontSize: 23,
                            color: Colors.black,
                          )),
                ),
                SizedBox(height: 15.0),
                GameButton(
                    padding: 25.0,
                    name: "Créer une partie",
                    route: () {
                      showModal(context);
                    }),
                GameButton(
                    padding: 32.0,
                    name: "Rejoindre une partie",
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
              title: Text('Créer une partie ${widget.modeName}'),
              content: Container(
                width: 500,
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Text("Créez une partie publique ou privée"),
                      CheckboxListTile(
                        title: Text('Partie privée'),
                        value: _isChecked,
                        onChanged: (newValue) {
                          setState(() {
                            _isChecked = newValue!;
                          });
                        },
                        controlAffinity: ListTileControlAffinity.leading,
                      ),
                      Container(
                        padding: const EdgeInsets.all(8.0),
                        child: TextFormField(
                          controller: humanPlayersController,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                              border: OutlineInputBorder(),
                              hintText: "Nombres de joueurs humains",
                              labelText: "Nombres de joueurs humains"),
                          validator: (String? value) {
                            if (value == null || value.isEmpty) {
                              return "Nombre de joeurs humains requis.";
                            } else if (int.parse(value) < 2) {
                              return "Le nombre de joueurs humains minimum est de 2.";
                            } else if (int.parse(value) > 4) {
                              return "Le nombre de joueurs humains maximum est de 4.";
                            }
                            return null;
                          },
                        ),
                      ),
                      if (isClassicMode)
                        Container(
                          padding: const EdgeInsets.all(8.0),
                          child: TextFormField(
                            controller: timeController,
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(
                                border: OutlineInputBorder(),
                                hintText: 'Temps par tour (s)',
                                labelText: 'Temps'),
                            validator: (String? value) {
                              if (value == null || value.isEmpty) {
                                return "Temps par tour requis.";
                              } else if (int.parse(value) < MIN_TIME_TURN) {
                                return "Le temps minimum est 30 secondes.";
                              } else if (int.parse(value) > MAX_TIME_TURN) {
                                return "Le temps maximum est de 300 secondes.";
                              }
                              return null;
                            },
                          ),
                        ),
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Text(
                          "Dictionnaire de jeu",
                        ),
                      ),
                      DropdownButtonFormField(
                          validator: (value) => value == null
                              ? "Veillez choisir un dictionnaire"
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
                                hintText: 'Mot de passe de partie',
                                labelText:
                                    'Mot de passe de partie publique (optionnel)'),
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
                    "Annuler",
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    createGame(_isChecked);
                  },
                  child: Text(
                    "Créer la partie",
                  ),
                )
              ],
            );
          });
        });
  }
}
