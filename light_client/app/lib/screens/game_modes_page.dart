import 'package:app/screens/game_mode_choices.dart';
import 'package:app/widgets/button.dart';
import 'package:app/widgets/parent_widget.dart';
import 'package:flutter/material.dart';
import '../constants/constants.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/main.dart';
import 'package:app/services/user_infos.dart';
import 'package:app/services/api_service.dart';

class GameModes extends StatefulWidget {
  const GameModes({super.key});

  @override
  State<GameModes> createState() => _GameModesState();
}

class _GameModesState extends State<GameModes> {
  void logoutUser() async {
    String username = getIt<UserInfos>().user;
    await ApiService().logoutUser(username);
    getIt<SocketService>().disconnect();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
          backgroundColor: Color.fromARGB(255, 32, 107, 34),
          duration: Duration(seconds: 3),
          content: Text("Vous avez été déconnecté avec succés")),
    );
    Navigator.pushNamed(context, '/loginScreen');
  }

  @override
  Widget build(BuildContext context) {
    return ParentWidget(
        child: Stack(
      children: [
        Center(
          child: Container(
            height: 500,
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
                Padding(
                  padding: const EdgeInsets.only(top: 60.0),
                  child: Text('Application Scrabble',
                      style: TextStyle(
                        fontSize: 23,
                        color: Colors.black,
                        fontWeight: FontWeight.w700,
                      )),
                ),
                SizedBox(height: 16.0),
                GameButton(
                    padding: 32.0,
                    name: "Mode de jeu classique",
                    route: () {
                      Navigator.push(context,
                          MaterialPageRoute(builder: (context) {
                        return GameChoices(
                          modeName: GameNames.classic,
                        );
                      }));
                    }),
                GameButton(
                    padding: 32.0,
                    name: "Mode de jeu coopératif",
                    route: () {
                      Navigator.push(context,
                          MaterialPageRoute(builder: (context) {
                        return GameChoices(
                          modeName: GameNames.cooperative,
                        );
                      }));
                    }),
                GameButton(
                    padding: 32.0,
                    name: "Déconnexion",
                    route: () {
                      showModal(context);
                    })
              ],
            ),
          ),
        ),
      ],
    ));
  }

  void showModal(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) => AlertDialog(
        title: const Text('Déconnexion'),
        content: const Text('Etes-vous sur de vous déconnecter ?'),
        actions: <TextButton>[
          TextButton(
            onPressed: () {
              logoutUser();
            },
            child: const Text('Oui'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
            },
            child: const Text('Non'),
          ),
        ],
      ),
    );
  }
}
