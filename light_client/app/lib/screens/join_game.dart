import 'package:app/constants/constants.dart';
import 'package:app/models/game.dart';
import 'package:app/screens/waiting_room.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/services/user_infos.dart';
import 'package:app/widgets/game_info.dart';
import 'package:flutter/material.dart';
import 'package:app/main.dart';

class JoinGames extends StatefulWidget {
  const JoinGames({super.key});

  @override
  State<JoinGames> createState() => _JoinGamesState();
}

class _JoinGamesState extends State<JoinGames> {
  String username = getIt<UserInfos>().user;
  List<Game> games = [];
  String mode = CLASSIC_MODE;

  @override
  void initState() {
    super.initState();
    handleSockets();
    getIt<SocketService>().send('update-joinable-matches', mode);
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

  void joinWaitingRoom(Game gameToJoin) {
    gameToJoin.usernameTwo = username;
    Navigator.push(context, MaterialPageRoute(builder: (context) {
      getIt<SocketService>().send('waiting-room-second-player', gameToJoin);
      return WaitingRoom();
    }));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Text(
          "Parties disponibles",
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
                  return GameInfo(
                    game: games[index],
                    joinGame: () {
                      try {
                        joinWaitingRoom(games[index]);
                      } catch (e) {
                        print(e);
                      }
                    },
                  );
                },
                separatorBuilder: (context, index) => SizedBox(
                      height: 10,
                    )),
          ],
        ),
      ),
    );
  }
}
