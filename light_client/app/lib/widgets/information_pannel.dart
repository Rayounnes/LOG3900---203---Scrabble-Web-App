import 'dart:async';
import 'dart:convert';
import 'package:app/models/game_player_infos.dart';
import 'package:flutter/material.dart';
import 'dart:typed_data';
import 'package:app/services/socket_client.dart';
import 'package:get_it/get_it.dart';
import 'package:app/main.dart';
import '../services/api_service.dart';
import '../services/user_infos.dart';

const DEFAULT_CLOCK = 60;
const ONE_SECOND = 1000;
const RESERVE_START_LENGTH = 102;

class TimerPage extends StatefulWidget {
  final bool isClassicMode;
  const TimerPage({super.key, required this.isClassicMode});

  @override
  _TimerPageState createState() => _TimerPageState();
}

class _TimerPageState extends State<TimerPage> {
  bool isHost = false;
  bool isGameFinished = false;
  bool isAbandon = false;
  int gameDuration = 0;
  bool isPlayersTurn = false;
  List<GamePlayerInfos> players = [];
  Map<String, MemoryImage> icons = new Map<String, MemoryImage>();
  int reserveTilesLeft = RESERVE_START_LENGTH;
  int _start = 60;
  int timerDuration = DEFAULT_CLOCK;
  int coins = 0;
  bool coinsGotFromDB = false;
  late Timer _timer;

  void startTimer() {
    const oneSec = Duration(seconds: 1);
    _timer = Timer.periodic(
      oneSec,
      (Timer timer) => setState(
        () {
          _start -= 1;
          if (_start == 0) {
            timer.cancel();
            print("sending change-user-turn from timer");
            getIt<SocketService>().send('change-user-turn');
          }
        },
      ),
    );
  }

  void clearInterval() {
    _timer.cancel();
    _start = timerDuration;
  }

  void handleSockets() {
    print("handle sockets information pannel");
    getIt<SocketService>().on('user-turn', (playerTurnId) {
      print("-------------------------------------------In user-turn pannel");
      if (widget.isClassicMode) {
        setState(() {
          isPlayersTurn = playerTurnId == getIt<SocketService>().socketId;
        });
        clearInterval();
        startTimer();
      }
      getIt<SocketService>().send('send-player-score');
    });
    getIt<SocketService>().on('send-info-to-panel', (infos) async {
      // d'abord get les photos ensuite executer setState
      // ne pas mettre setState a async
      var playersList = List<GamePlayerInfos>.from(infos['players']
          .map((player) => GamePlayerInfos.fromJson(player))
          .toList());
      for (var player in playersList) {
        if (player.socket == infos["turnSocket"]) {
          player.isTurn = true;
        } else {
          player.isTurn = false;
        }
      }
      for (var player in playersList) {
        if (player.isVirtualPlayer) {
          if (icons[player.username] == null) {
            try {
              ApiService().getAvatar("Bottt").then((response) {
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
        } else {
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
      }
      setState(() {
        players = playersList;
      });
    });
    getIt<SocketService>().on('freeze-timer', (_) {
      _timer.cancel();
    });
    getIt<SocketService>().on('send-game-timer', (seconds) {
      setState(() {
        timerDuration = seconds;
      });
    });
    getIt<SocketService>().on('update-reserve', (reserveLength) {
      setState(() {
        reserveTilesLeft = reserveLength;
      });
    });
    getIt<SocketService>().on('abandon-game', (abandonMessage) {
      isAbandon = true;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            backgroundColor: Colors.red,
            duration: Duration(seconds: 1),
            content: Text(abandonMessage)),
      );
    });
    getIt<SocketService>().on('end-game', (_) {
      // if (isAbandoned) isAbandon = true;
      isGameFinished = true;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            backgroundColor: Colors.green,
            duration: Duration(seconds: 1),
            content: Text('La partie est terminée')),
      );
      clearInterval();
    });
    getIt<SocketService>().on('coins-win', (coins) {
      print("coins gagnés : ${coins}");
      ApiService()
          .addCoinsToUser(getIt<UserInfos>().user, coins)
          .then((response) {
        if (response)
          setState(() {
            coins += coins;
          });
      }).catchError((error) {
        print('Error in coins win: $error');
      });
    });
  }

  getUserCoins() {
    ApiService().getUserCoins(getIt<UserInfos>().user).then((response) {
      setState(() {
        coinsGotFromDB = true;
        coins = response[0];
      });
    }).catchError((error) {
      print('Error in coins win: $error');
    });
  }

  @override
  void initState() {
    super.initState();
    handleSockets();
    _timer = Timer(Duration(milliseconds: 1), () {});
    getIt<SocketService>().send('update-reserve');
    if (!coinsGotFromDB)
      getUserCoins(); // On doit s'assurer que la variable player est remplie avant d'ller get les coins
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  Color getColor(double value) {
    if (value < 0.2) {
      return Colors.red;
    } else if (value < 0.3) {
      return Colors.orange;
    } else if (value < 0.5) {
      return Colors.yellow;
    } else {
      return Colors.green;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 230,
      width: 800,
      decoration: BoxDecoration(
        color: Colors.grey,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          width: 1,
          color: Colors.grey,
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              Text(
                'Tuiles dans la réserve: ${reserveTilesLeft}',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              widget.isClassicMode ? timerWidget(context) : Container(),
            ],
          ),
          for (int i = 0; i < players.length; i += 2)
            Row(
              children: [
                playerInfos(players[i]),
                i + 1 < players.length
                    ? playerInfos(players[i + 1])
                    : Container(
                        width: 400,
                      ),
              ],
            ),
        ],
      ),
    );
  }

  Widget playerInfos(GamePlayerInfos player) {
    final usernamePlayer = getIt<SocketService>().socketId == player.socket
        ? "${player.username} (You)"
        : player.username;
    return Expanded(
      child: Card(
        color: player.isTurn ? Colors.green : Colors.grey[300],
        child: ListTile(
          leading: CircleAvatar(
            radius: 30,
            backgroundImage: icons[player.username],
          ),
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(usernamePlayer),
              getIt<SocketService>().socketId == player.socket
                  ? Container(
                      padding: EdgeInsets.all(4.0),
                      alignment: Alignment.center,
                      child: Text("$coins coins"),
                      decoration: BoxDecoration(
                        shape: BoxShape.rectangle,
                        color: Colors.yellow[700],
                      ))
                  : Container(),
            ],
          ),
          subtitle: Row(children: [
            Text('Tiles left: ${player.tiles}'),
          ]),
          trailing: Text(player.points.toString()),
        ),
      ),
    );
  }

  Widget timerWidget(context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: SizedBox(
        width: 35.0,
        height: 35.0,
        child: Stack(
          children: [
            Positioned.fill(
              child: CircularProgressIndicator(
                strokeWidth: 5.0,
                value: _start / timerDuration, //entre 0.0 et 1
                backgroundColor: Colors.grey[200],
                valueColor: AlwaysStoppedAnimation<Color>(
                    getColor(_start / timerDuration)),
              ),
            ),
            Center(
              child: Text(
                '$_start',
                style: TextStyle(
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
