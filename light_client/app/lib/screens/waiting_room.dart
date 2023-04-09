import 'dart:convert';

import 'package:app/constants/constants.dart';
import 'package:app/main.dart';
import 'package:app/models/game.dart';
import 'package:app/models/player_infos.dart';
import 'package:app/screens/game_mode_choices.dart';
import 'package:app/screens/game_page.dart';
import 'package:app/screens/join_game.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/services/translate_service.dart';
import 'package:app/widgets/button.dart';
import 'package:app/widgets/parent_widget.dart';
import 'package:app/widgets/text.dart';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/personnalisation.dart';
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
  Map<String, MemoryImage> icons = new Map<String, MemoryImage>();
  late Personnalisation langOrTheme;
  String lang = "en";
  TranslateService translate = new TranslateService();

  @override
  void initState() {
    super.initState();
    isClassic = widget.modeName == GameNames.classic;
    handleSockets();
    widget.waitingSocket();
  }

  @override
  void dispose() {
    print("dispose waiting room called");
    getIt<SocketService>().userSocket.off('create-game');
    getIt<SocketService>().userSocket.off('waiting-room-player');
    getIt<SocketService>().userSocket.off('waiting-player-status');
    getIt<SocketService>().userSocket.off('private-room-player');
    getIt<SocketService>().userSocket.off('joined-user-left');
    getIt<SocketService>().userSocket.off('joined-observer-left');
    getIt<SocketService>().userSocket.off('join-game');
    getIt<SocketService>().userSocket.off('cancel-match');
    super.dispose();
  }

  void getPlayersIcons() {
    for (var player in game.joinedPlayers) {
      if (icons[player.username] == null) {
        try {
          ApiService().getAvatar(player.username).then((response) {
            setState(() {
              icons[player.username] =
                  MemoryImage(base64Decode(response[0].split(',')[1]));
            });
          }).catchError((error) {
            print('Error fetching avatar: $error');
          });
        } catch (e) {
          print(e);
        }
      }
    }
    for (var observer in game.joinedObservers) {
      if (icons[observer.username] == null) {
        try {
          ApiService().getAvatar(observer.username).then((response) {
            setState(() {
              icons[observer.username] =
                  MemoryImage(base64Decode(response[0].split(',')[1]));
            });
          }).catchError((error) {
            print('Error fetching avatar: $error');
          });
        } catch (e) {
          print(e);
        }
      }
    }
  }

  Widget playerWaitingInfos(String player) {
    return Expanded(
      child: Card(
        color: game.hostUsername == player ? Colors.green : Colors.white,
        child: ListTile(
          leading: CircleAvatar(
            radius: 30,
            backgroundImage: icons[player],
          ),
          title: Text(player),
        ),
      ),
    );
  }

  void handleSockets() {
    getIt<SocketService>().on('create-game', (gameJson) {
      print("received create-game");
      setState(() {
        try {
          game = Game.fromJson(gameJson);
          isHost = true;
        } catch (e) {
          print(e);
        }
        getPlayersIcons();
      });
    });
    getIt<SocketService>().on('waiting-room-player', (gameJson) {
      setState(() {
        print("received game waiting room $gameJson");
        game = Game.fromJson(gameJson);
      });
      getPlayersIcons();
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
      Navigator.pop(context);
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
            content: Text(
                translate.translateString(lang, "La partie a été annulée."))),
      );
      Navigator.pop(context);
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return JoinGames(modeName: widget.modeName);
      }));
    });

    getIt<SocketService>().on("get-configs", (value) {
      langOrTheme = value;
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
                    TextPhrase(
                        text: (translate.translateString(
                                lang, "Salle d'attente de") +
                            " " +
                            game.hostUsername)),
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
                                  translate.translateString(lang, 'Joueurs'),
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 24,
                                  ),
                                ),
                              );
                            } else {
                              return playerWaitingInfos(
                                  game.joinedPlayers[index - 1].username);
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
                                      translate.translateString(
                                          lang, "Observateurs"),
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 24,
                                      ),
                                    ),
                                  );
                                } else {
                                  return playerWaitingInfos(
                                      game.joinedObservers[index - 1].username);
                                }
                              },
                            ))
                      ],
                    ]),
                    SizedBox(
                      height: 50,
                    ),
                    if (game.joinedPlayers.length < 2) ...[
                      TextPhrase(
                          text: translate.translateString(
                              lang, "En attente de joueurs")),
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: SizedBox(
                            height: 80,
                            width: 80,
                            child: CircularProgressIndicator()),
                      )
                    ],
                    TextPhrase(
                        text: translate.translateString(lang,
                                "Joueurs restants pour démarrer la partie:") +
                            " ${game.joinedPlayers.length == 1 ? 1 : 0}"),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (!isHost)
                          GameButton(
                            padding: 16.0,
                            name: translate.translateString(lang, "Quitter"),
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
                            isButtonDisabled: game.joinedPlayers.length < 2,
                          ),
                          GameButton(
                            padding: 16.0,
                            name: translate.translateString(
                                lang, "Annuler Partie"),
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
            title:
                Text(translate.translateString(lang, "Demande d'acceptation")),
            content: Text(userInfos.username +
                translate.translateString(lang,
                    "essaye de rejoindre la partie. Accepter ou rejeter le joueur?")),
            actions: <TextButton>[
              TextButton(
                onPressed: () {
                  print("accept player quit $acceptPlayerQuit");
                  getIt<SocketService>()
                      .send('reject-private-player', userInfos);
                  Navigator.pop(context);
                },
                child: Text(translate.translateString(lang, 'Rejeter')),
              ),
              TextButton(
                onPressed: () {
                  getIt<SocketService>()
                      .send('accept-private-player', userInfos);
                  Navigator.pop(context);
                },
                child: Text(translate.translateString(lang, 'Accepter')),
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
              content: Text(userInfos.username +
                  translate.translateString(
                      lang, "a quitté l'attente d'acceptation."))),
        );
      }
    });
  }
}
