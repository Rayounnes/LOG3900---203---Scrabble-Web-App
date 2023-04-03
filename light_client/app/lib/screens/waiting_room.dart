import 'package:app/constants/constants.dart';
import 'package:app/main.dart';
import 'package:app/models/game.dart';
import 'package:app/models/player_infos.dart';
import 'package:app/screens/game_mode_choices.dart';
import 'package:app/screens/game_page.dart';
import 'package:app/screens/join_game.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/widgets/button.dart';
import 'package:app/widgets/parent_widget.dart';
import 'package:app/widgets/text.dart';
import 'package:flutter/material.dart';

import '../widgets/loading_tips.dart';

class WaitingRoom extends StatefulWidget {
  final String modeName;
  final Function waitingSocket;
  const WaitingRoom(
      {super.key, required this.modeName, required this.waitingSocket});

  @override
  _WaitingRoomState createState() => _WaitingRoomState();
}

class _WaitingRoomState extends State<WaitingRoom> {
  bool isHost = false;
  bool isObserver = false;
  bool isClassic = false;
  bool acceptPlayerQuit = false;
  String hostUsername = '';
  Game game = Game(hostUsername: "", time: 60);

  @override
  void initState() {
    super.initState();
    isClassic = widget.modeName == GameNames.classic;
    handleSockets();
    widget.waitingSocket();
  }

  @override
  void dispose() {
    print("dispose called");
    getIt<SocketService>().userSocket.off('create-game');
    getIt<SocketService>().userSocket.off('waiting-room-player');
    getIt<SocketService>().userSocket.off('waiting-player-status');
    getIt<SocketService>().userSocket.off('private-room-player');
    getIt<SocketService>().userSocket.off('joined-user-left');
    getIt<SocketService>().userSocket.off('joined-observer-left');
    getIt<SocketService>().userSocket.off('join-game');
    print("disposing cancel-match");
    getIt<SocketService>().userSocket.off('cancel-match');
    super.dispose();
  }

  void handleSockets() {
    getIt<SocketService>().on('create-game', (gameJson) {
      print("received create-game");
      setState(() {
        try {
          print(gameJson);
          game = Game.fromJson(gameJson);
          isHost = true;
        } catch (e) {
          print(e);
        }
      });
    });
    getIt<SocketService>().on('waiting-room-player', (gameJson) {
      setState(() {
        print("received game waiting room $gameJson");
        game = Game.fromJson(gameJson);
      });
    });
    getIt<SocketService>().on('waiting-player-status', (observerPerson) {
      setState(() {
        isObserver = observerPerson;
      });
    });
    getIt<SocketService>().on('private-room-player', (userInfosJson) {
      openAcceptDialog(context, PlayerInfos.fromJson(userInfosJson));
    });

    getIt<SocketService>().on('joined-user-left', (username) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            backgroundColor: Colors.blue,
            duration: Duration(seconds: 3),
            content: Text("${username}  a quitté la partie.")),
      );
    });
    getIt<SocketService>().on('joined-observer-left', (username) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            backgroundColor: Colors.blue,
            duration: Duration(seconds: 3),
            content: Text("${username} a quitté l'observation de la partie.")),
      );
    });
    getIt<SocketService>().on('join-game', (observer) {
      print("---------received join-game-----------");
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return GamePage(
          isClassicMode: isClassic,
          isObserver: observer,
          joinGameSocket: () {
            getIt<SocketService>().send('start-game-light-client');
          },
        );
      }));
    });
    getIt<SocketService>().on('cancel-match', (_) {
      print(".on cancel-match");
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            backgroundColor: Colors.blue,
            duration: Duration(seconds: 3),
            content: Text("La partie a été annulée.")),
      );
      Navigator.pop(context);
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return JoinGames(modeName: widget.modeName);
      }));
    });
  }

  void cancelWaiting() {
    getIt<SocketService>().send('joined-user-left', isObserver);
    Navigator.pop(context);
    Navigator.push(context, MaterialPageRoute(builder: (context) {
      return JoinGames(modeName: widget.modeName);
    }));
  }

  void cancelMatch() {
    getIt<SocketService>().send('cancel-match');
    Navigator.pop(context);
    Navigator.push(context, MaterialPageRoute(builder: (context) {
      return GameChoices(modeName: widget.modeName);
    }));
  }

  @override
  Widget build(BuildContext context) {
    return ParentWidget(
        child: Scaffold(
            backgroundColor: Colors.green[800],
            bottomNavigationBar: LoadingTips(),
            body: Center(
              child: Container(
                height: 1000,
                width: 700,
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
                    TextPhrase(text: "Salle d'attente de ${game.hostUsername}"),
                    SizedBox(
                      height: 30,
                    ),
                    Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                      Container(
                        height: 300,
                        width: 200,
                        child: ListView.builder(
                          itemCount: game.joinedPlayers.length + 1,
                          shrinkWrap: true,
                          physics: BouncingScrollPhysics(),
                          itemBuilder: (context, index) {
                            if (index == 0) {
                              return ListTile(
                                title: Text(
                                  'Joueurs',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 24,
                                  ),
                                ),
                              );
                            } else {
                              return ListTile(
                                title: Text(
                                    game.joinedPlayers[index - 1].username),
                              );
                            }
                          },
                        ),
                      ),
                      if (!game.isPrivate) ...[
                        Container(
                            height: 300,
                            width: 200,
                            child: ListView.builder(
                              itemCount: game.joinedObservers.length + 1,
                              shrinkWrap: true,
                              physics: BouncingScrollPhysics(),
                              itemBuilder: (context, index) {
                                if (index == 0) {
                                  return ListTile(
                                    title: Text(
                                      'Observateurs',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 24,
                                      ),
                                    ),
                                  );
                                } else {
                                  return ListTile(
                                    title: Text(game
                                        .joinedObservers[index - 1].username),
                                  );
                                }
                              },
                            ))
                      ],
                    ]),
                    SizedBox(
                      height: 50,
                    ),
                    if (!game.isFullPlayers) ...[
                      TextPhrase(text: "En attente de joueurs"),
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: SizedBox(
                            height: 80,
                            width: 80,
                            child: CircularProgressIndicator()),
                      )
                    ],
                    TextPhrase(
                        text:
                            "Joueurs restants pour démarrer la partie: ${game.humanPlayers - game.joinedPlayers.length}"),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (!isHost)
                          GameButton(
                            padding: 16.0,
                            name: "Quitter",
                            route: () {
                              cancelWaiting();
                            },
                            isButtonDisabled: false,
                          ),
                        if (isHost) ...[
                          GameButton(
                            padding: 16.0,
                            name: "Lancer Partie",
                            route: () {
                              // true: isLightClient
                              getIt<SocketService>().send('join-game', true);
                            },
                            isButtonDisabled:
                                game.humanPlayers != game.joinedPlayers.length,
                          ),
                          GameButton(
                            padding: 16.0,
                            name: "Annuler Partie",
                            route: () {
                              cancelMatch();
                            },
                            isButtonDisabled: false,
                          )
                        ]
                      ],
                    ),
                  ],
                ),
              ),
            )));
  }

  void openAcceptDialog(BuildContext context, PlayerInfos userInfos) {
    showDialog(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          getIt<SocketService>().on('left-private-player', (_) {
            Navigator.pop(context, true);
          });
          return AlertDialog(
            title: const Text("Demande d'acceptation"),
            content: Text(
                "${userInfos.username} essaye de rejoindre la partie. Accepter ou rejeter le joueur?"),
            actions: <TextButton>[
              TextButton(
                onPressed: () {
                  print("accept player quit $acceptPlayerQuit");
                  getIt<SocketService>()
                      .send('reject-private-player', userInfos);
                  Navigator.pop(context);
                },
                child: const Text('Rejeter'),
              ),
              TextButton(
                onPressed: () {
                  getIt<SocketService>()
                      .send('accept-private-player', userInfos);
                  Navigator.pop(context);
                },
                child: const Text('Accepter'),
              ),
            ],
          );
        }).then((leftPlayer) {
      if (leftPlayer == null) return;

      if (leftPlayer) {
        getIt<SocketService>().userSocket.off('left-private-player');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              backgroundColor: Colors.blue,
              duration: Duration(seconds: 3),
              content: Text(
                  "${userInfos.username} a quitté l'attente d'acceptation.")),
        );
      }
    });
  }
}
