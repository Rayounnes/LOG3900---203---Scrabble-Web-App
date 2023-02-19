import 'package:app/constants/constants.dart';
import 'package:app/models/game.dart';
import 'package:app/screens/channels_page.dart';
import 'package:app/screens/join_game.dart';
import 'package:app/screens/waiting_room.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/widgets/button.dart';
import 'package:flutter/material.dart';
import 'package:app/main.dart';
import 'package:app/services/user_infos.dart';
import 'package:app/services/api_service.dart';

class GameChoices extends StatefulWidget {
  const GameChoices({super.key});

  @override
  State<GameChoices> createState() => _GameChoicesState();
}

class _GameChoicesState extends State<GameChoices> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final timeController = TextEditingController(text: "60");
  Game game = Game(
      usernameOne: getIt<UserInfos>().user,
      time: 60,
      mode: CLASSIC_MODE,
      type: GAME_TYPE,
      dictionary: FRENCH_DICTIONNARY);

  String dictionary = "Francais";
  List<DropdownMenuItem<String>> dictionnaries = [
    DropdownMenuItem(child: Text("Francais"), value: "Francais"),
    DropdownMenuItem(child: Text("Anglais"), value: "Anglais"),
  ];

  createGame() {
    if (!_formKey.currentState!.validate()) return;
    game.time = int.parse(timeController.text);
    game.dictionary =
        dictionary == "Francais" ? FRENCH_DICTIONNARY : ENGLISH_DICTIONNARY;
    getIt<SocketService>().send('create-game', game);
    Navigator.push(context, MaterialPageRoute(builder: (context) {
      return WaitingRoom();
    }));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.blue[200],
        title: Text(
          "Mode de jeu Classique",
          style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
        ),
      ),
      backgroundColor: Colors.blueGrey,
      body: Center(
        child: Container(
          height: 500,
          width: 500,
          decoration: BoxDecoration(
            color: Colors.blue[200],
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              width: 1,
              color: Colors.grey,
            ),
          ),
          child: Column(
            children: <Widget>[
              Padding(
                padding: const EdgeInsets.only(top: 60.0),
                child: Text('Mode de jeu classique',
                    style: TextStyle(
                      fontSize: 23,
                      color: Colors.black,
                      fontWeight: FontWeight.w700,
                    )),
              ),
              SizedBox(height: 16.0),
              GameButton(
                  padding: 32.0,
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
                      return JoinGames();
                    }));
                  }),
            ],
          ),
        ),
      ),
    );
  }

  void showModal(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) => AlertDialog(
        title: const Text('Créer une partie classique'),
        content: Container(
          height: 400,
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    "Temps par tour (en secondes) ",
                  ),
                ),
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
                    "Choisissez un dictionnaire",
                  ),
                ),
                DropdownButtonFormField(
                    validator: (value) =>
                        value == null ? "Select a country" : null,
                    value: dictionary,
                    onChanged: (String? newValue) {
                      setState(() {
                        dictionary = newValue!;
                      });
                    },
                    items: dictionnaries),
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
              createGame();
            },
            child: Text(
              "Créer la partie",
            ),
          )
        ],
      ),
    );
  }
}
