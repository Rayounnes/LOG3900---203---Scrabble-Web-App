import 'dart:core';
import 'dart:typed_data';

import 'package:app/screens/user_account_edit_page.dart';
import 'package:app/widgets/connexion_history.dart';
import 'package:app/widgets/parent_widget.dart';
import 'package:app/widgets/stats_table.dart';
import 'package:app/services/translate_service.dart';
import 'package:flutter/material.dart';
import '../main.dart';
import '../services/socket_client.dart';

class UserAccountPage extends StatefulWidget {
  final String userName;
  final Uint8List decodedBytes;
  final List<dynamic> connexionHistory;

  const UserAccountPage(
      {super.key,
      required this.userName,
      required this.connexionHistory,
      required this.decodedBytes});

  @override
  _UserAccountPageState createState() => _UserAccountPageState();
}

class _UserAccountPageState extends State<UserAccountPage> {
  List<String> connexionHistory = [];
  List<String> deconnexionHistory = [];
  bool showHistory = false;
  bool showTableChart = false;
  bool isEmpty = true;
  String lang = "en";
  int gamesPlayed = 0;
  int gamesWon = 0;
  int avgPointsPerGame = 0;
  String avgTimePerGame = "";
  List gamesHistory = [];
  TranslateService translate = TranslateService();
  String theme = "white";

  @override
  void initState() {
    super.initState();
    fillHistoryList();
    getIt<SocketService>().send("get-number-games");
    getIt<SocketService>().send('get-number-games-won');
    getIt<SocketService>().send("get-points-mean");
    getIt<SocketService>().send("get-game-average");
    getIt<SocketService>().send('get-game-history');
    handleSockets();
    getConfigs();
  }

  getConfigs() {
    getIt<SocketService>().send("get-config");
  }

  @override
  void dispose() {
    getIt<SocketService>().userSocket.off("get-number-games");
    getIt<SocketService>().userSocket.off('get-number-games-won');
    getIt<SocketService>().userSocket.off("get-points-mean");
    getIt<SocketService>().userSocket.off("get-game-average");
    getIt<SocketService>().userSocket.off('get-game-history');
    getIt<SocketService>().userSocket.off("get-config");
    super.dispose();
  }

  handleSockets() {
    getIt<SocketService>().on("get-number-games", (games) {
      gamesPlayed = games;
    });
    getIt<SocketService>().on('get-number-games-won', (games) {
      gamesWon = games;
    });
    getIt<SocketService>().on("get-points-mean", (points) {
      avgPointsPerGame = points;
    });
    getIt<SocketService>().on("get-game-average", (average) {
      avgTimePerGame = average;
    });
    getIt<SocketService>().on('get-game-history', (gameHistory) {
      gamesHistory = gameHistory;
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

  void fillHistoryList() {
    for (var element in widget.connexionHistory) {
      print(element[1]);
      if(element[1] == true){
        connexionHistory.add(element[0]);
        print(connexionHistory);
      }else{
        deconnexionHistory.add(element[0]);
        print(deconnexionHistory);
      }
      isEmpty = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return ParentWidget(
        child: Scaffold(
      appBar: AppBar(
        title: Text(
          translate.translateString(lang, 'Mon compte'),
        ),
      ),
      body: Container(
        color: theme == "dark"
            ? Colors.green[800]
            : Color.fromARGB(255, 207, 241, 207),
        child: Padding(
          padding: const EdgeInsets.all(80.0),
          child: Center(
            child: Container(
              color: theme == "dark"
                  ? Color.fromARGB(255, 203, 201, 201)
                  : Colors.white,
              child: Column(
                children: [
                  Container(
                    padding: EdgeInsets.all(12),
                    child: Text(
                      isEmpty
                          ? ''
                          : translate.translateString(
                                  lang, "Dernière connexion") +
                              ": ${widget.connexionHistory[widget.connexionHistory.length - 1][0]}",
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
                    ),
                  ),
                  Container(
                    padding: EdgeInsets.all(10),
                    child: Column(
                      children: [
                        Text(
                          widget.userName,
                          style: TextStyle(
                              fontSize: 30, fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: EdgeInsets.all(20),
                    child: Image.memory(widget.decodedBytes,
                        height: 180, width: 180),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                UserAccountEditPage(username: widget.userName),
                          ),
                        );
                      },
                      child: Icon(Icons.mode_edit),
                    ),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(top: 20.0, right: 20.0),
                        child: ElevatedButton(
                          onPressed: () {
                            setState(() {
                              showTableChart = false;
                              showHistory = !showHistory;
                            });
                          },
                          child: Icon(Icons.history,
                              color: showHistory
                                  ? Color.fromARGB(255, 173, 169, 80)
                                  : Color.fromARGB(255, 30, 61, 103)),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(top: 20.0, left: 20.0),
                        child: ElevatedButton(
                          onPressed: () {
                            setState(() {
                              showHistory = false;
                              showTableChart = !showTableChart;
                            });
                          },
                          child: Icon(Icons.table_chart,
                              color: showTableChart
                                  ? Color.fromARGB(255, 173, 169, 80)
                                  : Color.fromARGB(255, 30, 61, 103)),
                        ),
                      ),
                    ],
                  ),
                  if (showHistory)
                    Padding(
                      padding: const EdgeInsets.only(top: 15.0),
                      child: Container(
                        height: 400,
                        child: ConnectionHistoryList(
                          connectionHistory: List.from(connexionHistory.reversed),
                          deconnectionHistory: List.from(deconnexionHistory.reversed),
                          gameHistory: List.from(gamesHistory.reversed),
                          lang: lang,
                          theme: theme,
                        ),
                      ),
                    ),
                  if (showTableChart)
                    Padding(
                      padding: const EdgeInsets.all(15.0),
                      child: StatsTable(
                        gamesPlayed: gamesPlayed,
                        gamesWon: gamesWon,
                        avgPointsPerGame: avgPointsPerGame,
                        avgTimePerGame: avgTimePerGame,
                        lang: lang,
                        theme: theme,
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    ));
  }
}
