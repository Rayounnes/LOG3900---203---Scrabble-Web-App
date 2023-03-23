import 'dart:async';
import 'dart:convert';
import 'package:app/models/game_player_infos.dart';
import 'package:flutter/material.dart';
import 'dart:typed_data';
import 'package:app/services/socket_client.dart';
import 'package:get_it/get_it.dart';
import 'package:app/main.dart';
import '../services/api_service.dart';

const DEFAULT_CLOCK = 60;
const ONE_SECOND = 1000;
const RESERVE_START_LENGTH = 102;

class TimerPage extends StatefulWidget {
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
      setState(() {
        isPlayersTurn = playerTurnId == getIt<SocketService>().socketId;
      });
      clearInterval();
      print("-------------------------------------------Starting timer");
      startTimer();
      getIt<SocketService>().send('send-player-score');
    });
    getIt<SocketService>().on('send-info-to-panel', (infos) async {
      // d'abord get les photos ensuite executer setState
      // ne pas mettre setState a async
      print("-------------------------------------getting send info to pannel");
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
                icons[player.username] =
                    MemoryImage(base64Decode(response[0].split(',')[1]));
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
                icons[player.username] =
                    MemoryImage(base64Decode(response[0].split(',')[1]));
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
      // this.snackBar.open(abandonMessage, 'Fermer', {
      //     duration: 1000,
      //     panelClass: ['snackbar'],
      // });
    });
    getIt<SocketService>().on('end-game', (_) {
      // if (isAbandoned) isAbandon = true;
      isGameFinished = true;
      // this.snackBar.open('La partie est terminée', 'Fermer', {
      //     duration: 1000,
      //     panelClass: ['snackbar'],
      // });
      clearInterval();
    });
  }

  @override
  void initState() {
    super.initState();
    handleSockets();
    _timer = Timer(Duration(milliseconds: 1), () {});
    getIt<SocketService>().send('update-reserve');
    // startTimer();
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
                style: TextStyle(
                  fontSize: 16.0,
                ),
              ),
              timerWidget(context),
            ],
          ),
          for (int i = 0; i < players.length; i += 2)
            Row(
              children: [
                playerInfos(players[i]),
                playerInfos(players[i + 1]),
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
          title: Text(usernamePlayer),
          subtitle: Text('Tiles left: ${player.tiles}'),
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
