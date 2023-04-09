import 'package:app/constants/constants.dart';
import 'package:app/models/game.dart';
import 'package:app/models/player_infos.dart';
import 'package:app/screens/game_page.dart';
import 'package:app/screens/waiting_room.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/services/translate_service.dart';
import 'package:app/services/user_infos.dart';
import 'package:app/widgets/parent_widget.dart';
import 'package:flutter/material.dart';
import 'package:app/main.dart';

import '../models/personnalisation.dart';
import '../widgets/loading_tips.dart';

class JoinGames extends StatefulWidget {
  final String modeName;
  const JoinGames({super.key, required this.modeName});

  @override
  State<JoinGames> createState() => _JoinGamesState();
}

class _JoinGamesState extends State<JoinGames> {
  String username = getIt<UserInfos>().user;
  List<Game> games = [];
  bool isClassic = false;
  String lang = "en";
  String theme = "white";
  TranslateService translate = new TranslateService();

  @override
  void initState() {
    super.initState();
    getConfigs();

    handleSockets();
    isClassic = widget.modeName == GameNames.classic;
    getIt<SocketService>().send('update-joinable-matches', isClassic);
  }

  @override
  void dispose() {
    getIt<SocketService>().userSocket.off('update-joinable-matches');
    getIt<SocketService>().userSocket.off("get-config");
    super.dispose();
  }

  getConfigs() {
    getIt<SocketService>().send("get-config");
  }

  void handleSockets() {
    getIt<SocketService>().on('update-joinable-matches', (gamesJson) {
      if (!mounted) return;
      setState(() {
        games = [];
        for (final game in gamesJson) {
          games.add(Game.fromJson(game));
        }
      });
    });

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

  goToWaitingRoom(Game gameToJoin) {
    Navigator.push(context, MaterialPageRoute(builder: (context) {
      return WaitingRoom(
        modeName: widget.modeName,
        waitingSocket: () {
          getIt<SocketService>().send('waiting-room-player', gameToJoin);
        },
      );
    }));
  }

  observeGame(Game gameToJoin) {
    // observer une partie qui a deja commencé
    if (gameToJoin.hasStarted) {
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return GamePage(
          isClassicMode: isClassic,
          isObserver: true,
          joinGameSocket: () {
            getIt<SocketService>().send('join-late-observer', gameToJoin);
          },
        );
      }));
    } else {
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return WaitingRoom(
          modeName: widget.modeName,
          waitingSocket: () {
            getIt<SocketService>().send('waiting-room-observer', gameToJoin);
          },
        );
      }));
    }
  }

  joinAsObserver(Game gameToJoin) {
    if (gameToJoin.password != "") {
      openGamePasswordDialog(context, gameToJoin, true);
    } else if (!gameToJoin.isPrivate) {
      observeGame(gameToJoin);
    }
  }

  joinWaitingRoom(Game gameToJoin) {
    if (gameToJoin.password != "") {
      getIt<SocketService>().send('waiting-password-game', gameToJoin);
      openGamePasswordDialog(context, gameToJoin, false);
    } else if (!gameToJoin.isPrivate) {
      goToWaitingRoom(gameToJoin);
    } else if (gameToJoin.isPrivate) {
      getIt<SocketService>().send('private-room-player', gameToJoin);
      openPrivateGameWaitingDialog(context, gameToJoin);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ParentWidget(
      child: Scaffold(
        backgroundColor: theme == "dark"
            ? Color.fromARGB(255, 32, 107, 34)
            : Color.fromARGB(255, 207, 241, 207),
        bottomNavigationBar: LoadingTips(lang),
        appBar: AppBar(
          backgroundColor: Colors.white,
          title: Text(
            translate.translateString(lang, "Parties") +
                " " +
                translate.translateString(lang, widget.modeName) +
                " " +
                translate.translateString(lang, "disponibles"),
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
          ),
        ),
        body: SingleChildScrollView(
          physics: BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              ListView.separated(
                  itemCount: games.length,
                  shrinkWrap: true,
                  padding: EdgeInsets.all(16),
                  physics: BouncingScrollPhysics(),
                  itemBuilder: (context, index) {
                    if (games[index].isFinished ||
                        (games[index].isPrivate && games[index].isFullPlayers))
                      return SizedBox.shrink();
                    return buildGameCard(context, games[index]);
                  },
                  separatorBuilder: (context, index) => SizedBox(
                        height: 10,
                      )),
            ],
          ),
        ),
      ),
    );
  }

  Widget buildGameCard(BuildContext context, Game game) {
    return Card(
        color:
            theme == "dark" ? Color.fromARGB(255, 116, 129, 117) : Colors.white,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  translate.translateString(lang, 'Partie de') +
                      " " +
                      game.hostUsername,
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                if (!game.isPrivate && game.password != "")
                  Text(translate.translateString(
                      lang, 'Publique (protégé par mot de passe)')),
                if (!game.isPrivate && game.password == "")
                  Text(translate.translateString(lang, 'Publique')),
                if (game.isPrivate)
                  Text(translate.translateString(lang, 'Privée')),
              ],
            ),
          ),
          Divider(height: 0),
          Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  translate.translateString(lang, 'Réglages de la partie:'),
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 8),
                Row(
                  children: <Widget>[
                    // Icon(Icons.people),
                    // SizedBox(width: 4.0),
                    // Text(game.humanPlayers.toString()),
                    // SizedBox(width: 16.0),
                    // Icon(Icons.smart_toy),
                    // SizedBox(width: 4.0),
                    // Text('${game.virtualPlayers}'),
                    // SizedBox(width: 16.0),
                    if (game.isClassicMode) ...[
                      Icon(Icons.timer),
                      SizedBox(width: 4.0),
                      Text('${game.time} (s)'),
                      SizedBox(width: 16.0)
                    ],
                    Icon(Icons.book),
                    SizedBox(width: 4.0),
                    Text(
                        translate.translateString(lang, game.dictionary.title)),
                  ],
                ),
                SizedBox(height: 16),
                Text(
                  game.hasStarted
                      ? translate.translateString(lang, "Partie en cours:")
                      : translate.translateString(lang, "Salle d'attente:"),
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 8),
                Row(
                  children: <Widget>[
                    PopupMenuButton<String>(
                      itemBuilder: (BuildContext context) {
                        return game.joinedPlayers.map((PlayerInfos player) {
                          return PopupMenuItem<String>(
                            value: player.username,
                            child: Text(player.username),
                          );
                        }).toList();
                      },
                      child: Row(children: [
                        Icon(
                          Icons.people,
                          size: 35.0,
                        ),
                        SizedBox(width: 4.0),
                        Text('${game.joinedPlayers.length}')
                      ]),
                      onSelected: (String selectedName) {
                        // Do something with the selected name
                      },
                    ),
                    SizedBox(width: 40.0),
                    if (game.isClassicMode)
                      PopupMenuButton<String>(
                        itemBuilder: (BuildContext context) {
                          List<PopupMenuItem<String>> items = [];
                          for (int i = 0; i < game.virtualPlayers; i++) {
                            items.add(
                              PopupMenuItem<String>(
                                value: 'Bot ${i + 1}',
                                child: Text('Bot ${i + 1}'),
                              ),
                            );
                          }
                          return items;
                        },
                        child: Row(children: [
                          Icon(
                            Icons.smart_toy,
                            size: 35.0,
                          ),
                          SizedBox(width: 4.0),
                          Text('${game.virtualPlayers}')
                        ]),
                        onSelected: (String selectedName) {
                          // Do something with the selected name
                        },
                      ),
                    if (!game.isPrivate) ...[
                      SizedBox(width: 40.0),
                      PopupMenuButton<String>(
                        itemBuilder: (BuildContext context) {
                          return game.joinedObservers.map((PlayerInfos player) {
                            return PopupMenuItem<String>(
                              value: player.username,
                              child: Text(player.username),
                            );
                          }).toList();
                        },
                        child: Row(children: [
                          Icon(
                            Icons.visibility,
                            size: 35.0,
                          ),
                          SizedBox(width: 4.0),
                          Text('${game.joinedObservers.length}')
                        ]),
                        onSelected: (String selectedName) {
                          // Do something with the selected name
                        },
                      ),
                    ],
                  ],
                )
              ],
            ),
          ),
          ButtonBar(
            children: <Widget>[
              ElevatedButton(
                onPressed:
                    game.playersWaiting + game.joinedPlayers.length == 4 ||
                            game.hasStarted
                        ? null
                        : () => joinWaitingRoom(game),
                child: Text(translate.translateString(lang, 'Rejoindre')),
              ),
              if (!game.isPrivate) ...[
                ElevatedButton(
                  onPressed: () => joinAsObserver(game),
                  child: Text(translate.translateString(lang, 'Observer')),
                  style: ButtonStyle(
                    backgroundColor:
                        MaterialStateProperty.all<Color>(Colors.orange),
                  ),
                ),
              ],
            ],
          ),
        ]));
  }

  dynamic openGamePasswordDialog(
      BuildContext context, Game gameToJoin, bool isObserver) {
    showDialog(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
          final passwordGameController = TextEditingController();
          return AlertDialog(
            title:
                Text(translate.translateString(lang, "Mot de passe de partie")),
            content: Form(
                key: _formKey,
                child: TextFormField(
                    controller: passwordGameController,
                    obscureText: true,
                    decoration: InputDecoration(
                        border: OutlineInputBorder(),
                        hintText: translate.translateString(
                            lang, 'Mot de passe de partie'),
                        labelText: translate.translateString(
                            lang, 'Mot de passe de partie')),
                    validator: (String? value) {
                      if (value == null || value.isEmpty) {
                        return translate.translateString(
                            lang, "Mot de passe requis.");
                      } else if (value != gameToJoin.password) {
                        return translate.translateString(
                            lang, "Mot de passe incorrect");
                      }
                      return null;
                    })),
            actions: <TextButton>[
              TextButton(
                onPressed: () {
                  Navigator.pop(context, false);
                },
                child: Text(translate.translateString(lang, 'Annuler')),
              ),
              TextButton(
                onPressed: () {
                  if (!_formKey.currentState!.validate()) return;
                  Navigator.pop(context, true);
                },
                child: Text(translate.translateString(lang, 'Ok')),
              ),
            ],
          );
        }).then((goodPassword) {
      if (goodPassword == null) return null;
      if (goodPassword) {
        isObserver ? observeGame(gameToJoin) : goToWaitingRoom(gameToJoin);
      } else {
        if (!isObserver)
          getIt<SocketService>().send('cancel-waiting-password', gameToJoin);
      }
    });
  }

  void openPrivateGameWaitingDialog(BuildContext context, Game gameToJoin) {
    showDialog(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          getIt<SocketService>().on('reject-private-player', (_) {
            Navigator.pop(context, false);
          });
          getIt<SocketService>().on('accept-private-player', (_) {
            Navigator.pop(context, true);
          });
          return AlertDialog(
            title:
                Text(translate.translateString(lang, "Attente d'acceptation")),
            content: Container(
              height: 150,
              child: Column(
                children: [
                  Text(translate.translateString(lang,
                      "Vous êtes en attente d'être accepté par le hôte de la partie")),
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: SizedBox(
                        height: 60,
                        width: 60,
                        child: CircularProgressIndicator()),
                  )
                ],
              ),
            ),
            actions: <TextButton>[
              TextButton(
                onPressed: () {
                  Navigator.pop(context, null);
                },
                child: Text(translate.translateString(lang, 'Annuler')),
              ),
            ],
          );
        }).then((acceptPlayer) {
      getIt<SocketService>().userSocket.off('reject-private-player');
      getIt<SocketService>().userSocket.off('accept-private-player');
      if (acceptPlayer == null)
        getIt<SocketService>().send('left-private-player', gameToJoin);
      else if (acceptPlayer)
        goToWaitingRoom(gameToJoin);
      else if (!acceptPlayer) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              backgroundColor: Colors.blue,
              duration: Duration(seconds: 3),
              content: Text(translate.translateString(
                  lang, "Vous avez été rejeté de la partie."))),
        );
      }
    });
  }
}
