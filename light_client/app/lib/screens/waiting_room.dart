import 'package:app/constants/constants.dart';
import 'package:app/main.dart';
import 'package:app/models/game.dart';
import 'package:app/screens/game_modes_page.dart';
import 'package:app/screens/game_page.dart';
import 'package:app/screens/join_game.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/widgets/button.dart';
import 'package:app/widgets/parent_widget.dart';
import 'package:app/widgets/text.dart';
import 'package:flutter/material.dart';
import 'package:app/services/user_infos.dart';

class WaitingRoom extends StatefulWidget {
  @override
  _WaitingRoomState createState() => _WaitingRoomState();
}

class _WaitingRoomState extends State<WaitingRoom> {
  @override
  void initState() {
    super.initState();
    handleSockets();
  }

  String username = getIt<UserInfos>().user;
  bool userKicked = false;
  bool userLeft = false;
  bool userCanceled = false;
  bool isHost = false;
  bool isJoinedPlayer = false;
  String hostUsername = '';
  String joinedUsername = '';
  String leftUsername = '';
  String mode = CLASSIC_MODE;

  void handleSockets() {
    getIt<SocketService>().on('create-game', (username) {
      if (!mounted) return;
      setState(() {
        hostUsername = username;
        isHost = true;
      });
    });
    getIt<SocketService>().on('waiting-room-second-player', (username) {
      if (!mounted) return;
      setState(() {
        try {
          joinedUsername = username;
          isJoinedPlayer = true;
        } catch (e) {
          print(e);
        }
      });
    });
    getIt<SocketService>().on('add-second-player-waiting-room', (gameJson) {
      try {
        Game game = Game.fromJson(gameJson);
        if (!mounted) return;
        setState(() {
          joinedUsername = game.usernameTwo;
          hostUsername = game.usernameOne;
        });
      } catch (e) {
        print(e);
      }
    });
    getIt<SocketService>().on('kick-user', (_) async {
      setState(() {
        userKicked = true;
      });
      await Future.delayed(const Duration(seconds: 3));
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return JoinGames();
      }));
    });
    getIt<SocketService>().on('joined-user-left', (_) {
      if (!mounted) return;
      setState(() {
        userLeft = true;
        leftUsername = joinedUsername;
        joinedUsername = '';
      });
    });
    getIt<SocketService>().on('join-game', (_) {
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return GamePage();
      }));
    });
  }

  void confirmUser() {
    getIt<SocketService>().send('join-game',
        <String, String>{"playerUsername": joinedUsername, "mode": mode});
  }

  void cancelWaitingJoinedUser() {
    getIt<SocketService>().send('joined-user-left');
    Navigator.push(context, MaterialPageRoute(builder: (context) {
      return JoinGames();
    }));
  }

  void cancelMatch() {
    getIt<SocketService>().send('cancel-match');
    Navigator.push(context, MaterialPageRoute(builder: (context) {
      return GameModes();
    }));
  }

  void kickUser() {
    getIt<SocketService>().send('kick-user', joinedUsername);
    setState(() {
      joinedUsername = '';
    });
  }

  @override
  Widget build(BuildContext context) {
    return ParentWidget(
        child: Scaffold(
            backgroundColor: Colors.blueGrey,
            body: Center(
              child: Container(
                height: 500,
                width: 700,
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
                    if (isHost) ...[
                      TextPhrase(text: "Bienvenue $username "),
                      joinedUsername == ""
                          ? TextPhrase(
                              text: "Vous êtes en attente d'un deuxieme joueur")
                          : TextPhrase(
                              text:
                                  "Veuillez confirmer le joueur $joinedUsername"),
                    ] else if (isJoinedPlayer) ...[
                      userKicked
                          ? TextPhrase(
                              text:
                                  "Le joueur $hostUsername vous a rejeté de la partie ! De retour dans la liste des parties")
                          : TextPhrase(
                              text:
                                  "Bienvenue $joinedUsername, vous etes bien en attente du demarrage de la partie par $hostUsername")
                    ],
                    SizedBox(
                      height: 30,
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        GameButton(
                          padding: 16.0,
                          name: "Annuler",
                          route: () {
                            isHost ? cancelMatch() : cancelWaitingJoinedUser();
                          },
                          isButtonDisabled: false,
                        ),
                        GameButton(
                          padding: 16.0,
                          name: "Accepter",
                          route: () {
                            confirmUser();
                          },
                          isButtonDisabled: isJoinedPlayer,
                        ),
                        GameButton(
                          padding: 16.0,
                          name: "Rejeter",
                          route: () {
                            kickUser();
                          },
                          isButtonDisabled: isJoinedPlayer,
                        )
                      ],
                    ),
                    SizedBox(
                      height: 30,
                    ),
                    if ((joinedUsername == "" && isHost) || isJoinedPlayer) ...[
                      SizedBox(
                          height: 80,
                          width: 80,
                          child: CircularProgressIndicator())
                    ]
                  ],
                ),
              ),
            )));
  }
}
