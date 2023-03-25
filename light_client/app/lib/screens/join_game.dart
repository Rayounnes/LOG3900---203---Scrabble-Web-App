import 'package:app/constants/constants.dart';
import 'package:app/models/game.dart';
import 'package:app/screens/game_mode_choices.dart';
import 'package:app/screens/waiting_room.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/services/user_infos.dart';
import 'package:app/widgets/game_info.dart';
import 'package:app/widgets/parent_widget.dart';
import 'package:flutter/material.dart';
import 'package:app/main.dart';

class JoinGames extends StatefulWidget {
  final String modeName;
  const JoinGames({super.key, required this.modeName});

  @override
  State<JoinGames> createState() => _JoinGamesState();
}

class _JoinGamesState extends State<JoinGames> {
  String username = getIt<UserInfos>().user;
  List<Game> games = [];
  String mode = CLASSIC_MODE;
  bool isClassic = false;

  @override
  void initState() {
    super.initState();
    handleSockets();
    isClassic = widget.modeName == GameNames.classic;
    getIt<SocketService>().send('update-joinable-matches', isClassic);
  }

  @override
  void dispose() {
    getIt<SocketService>().userSocket.off('update-joinable-matches');
    super.dispose();
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
    // changer par le socket pour aller a une partie
    if (gameToJoin.hasStarted)
      getIt<SocketService>().send('waiting-room-player', gameToJoin);
    else {
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
        backgroundColor: Colors.green[800],
        appBar: AppBar(
          backgroundColor: Colors.white,
          leading: IconButton(
              icon: Icon(Icons.arrow_back),
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) {
                  return GameChoices(modeName: widget.modeName);
                }));
              }),
          title: Text(
            "Parties ${widget.modeName} disponibles",
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
        color: Color.fromRGBO(203, 201, 201, 1),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Partie de ${game.hostUsername}',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                if (!game.isPrivate && game.password != "")
                  Text('Publique (protégé par mot de passe)'),
                if (!game.isPrivate && game.password == "") Text('Publique'),
                if (game.isPrivate) Text('Privée'),
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
                  'Réglages de la partie:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 8),
                Row(
                  children: <Widget>[
                    Icon(Icons.people),
                    SizedBox(width: 4.0),
                    Text(game.humanPlayers.toString()),
                    SizedBox(width: 16.0),
                    Icon(Icons.smart_toy),
                    SizedBox(width: 4.0),
                    Text('${4 - game.humanPlayers}'),
                    SizedBox(width: 16.0),
                    Icon(Icons.timer),
                    SizedBox(width: 4.0),
                    Text('${game.time} (s)'),
                    SizedBox(width: 16.0),
                    Icon(Icons.book),
                    SizedBox(width: 4.0),
                    Text(game.dictionary.title),
                  ],
                ),
                SizedBox(height: 16),
                Text(
                  game.hasStarted ? 'Partie en cours:' : 'Salle d\'attente:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 8),
                Row(
                  children: <Widget>[
                    Icon(Icons.people),
                    SizedBox(width: 4.0),
                    Text('${game.joinedPlayers.length}'),
                    if (!game.isPrivate) ...[
                      SizedBox(width: 16.0),
                      Icon(Icons.visibility),
                      SizedBox(width: 4.0),
                      Text('${game.joinedObservers.length}'),
                    ],
                  ],
                )
              ],
            ),
          ),
          ButtonBar(
            children: <Widget>[
              ElevatedButton(
                onPressed: game.playersWaiting + game.joinedPlayers.length ==
                            game.humanPlayers ||
                        game.isFullPlayers
                    ? null
                    : () => joinWaitingRoom(game),
                child: Text('Rejoindre'),
              ),
              if (!game.isPrivate) ...[
                ElevatedButton(
                  onPressed: () => joinAsObserver(game),
                  child: Text('Observer'),
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
            title: const Text("Mot de passe de partie"),
            content: Form(
                key: _formKey,
                child: TextFormField(
                    controller: passwordGameController,
                    obscureText: true,
                    decoration: InputDecoration(
                        border: OutlineInputBorder(),
                        hintText: 'Mot de passe de partie',
                        labelText: 'Mot de passe de partie'),
                    validator: (String? value) {
                      if (value == null || value.isEmpty) {
                        return "Mot de passe requis.";
                      } else if (value != gameToJoin.password) {
                        return "Mot de passe incorrect";
                      }
                      return null;
                    })),
            actions: <TextButton>[
              TextButton(
                onPressed: () {
                  print("poping the dialog");
                  Navigator.pop(context, false);
                },
                child: const Text('Annuler'),
              ),
              TextButton(
                onPressed: () {
                  if (!_formKey.currentState!.validate()) return;
                  Navigator.pop(context, true);
                },
                child: const Text('Ok'),
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
            title: const Text("Attente d'acceptation"),
            content: Container(
              height: 150,
              child: Column(
                children: [
                  Text(
                      "Vous êtes en attente d'être accepté par le hôte de la partie"),
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
                child: const Text('Annuler'),
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
        const message = 'Vous avez été rejeté de la partie.';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              backgroundColor: Colors.blue,
              duration: Duration(seconds: 3),
              content: Text("Vous avez été rejeté de la partie.")),
        );
      }
    });
  }
}
