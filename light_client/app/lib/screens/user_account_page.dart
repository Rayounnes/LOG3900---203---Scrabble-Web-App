import 'dart:core';
import 'dart:typed_data';

import 'package:app/screens/user_account_edit_page.dart';
import 'package:app/widgets/connexion_history.dart';
import 'package:app/widgets/stats_table.dart';
import 'package:app/services/translate_service.dart';
import 'package:flutter/material.dart';
import '../main.dart';
import '../models/personnalisation.dart';
import '../services/socket_client.dart';

class UserAccountPage extends StatefulWidget {
  final String userName;

  final int userPoints;

  final Uint8List decodedBytes;
  final List<dynamic> connexionHistory;

  const UserAccountPage(
      {super.key,
      required this.userName,
      required this.userPoints,
      required this.connexionHistory,
      required this.decodedBytes});

  @override
  _UserAccountPageState createState() => _UserAccountPageState();
}

class _UserAccountPageState extends State<UserAccountPage> {
  List<String> newList = [];
  bool showHistory = false;
  bool showTableChart = false;
  bool isEmpty = true;
    String lang = "en";
  TranslateService translate = new TranslateService();

  @override
  void initState() {
    super.initState();

    fillHistoryLit();
  }

  getConfigs() {
    getIt<SocketService>().send("get-config");
  }

  void handleSockets() {
    getIt<SocketService>().on("get-config", (value) {
      lang = value['language'];
      if (mounted) {
        setState(() {
          lang = value['language'];
        });
      }

    });
  }

  @override
  void dispose() {
    super.dispose();
  }

  void fillHistoryLit() {
    for (var element in widget.connexionHistory) {
      newList.add(element[0]);
      isEmpty = false;
    }
  }

@override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          translate.translateString(lang,'Mon compte'),
        ),
      ),
      body: Container(color: Color.fromARGB(255, 43, 150, 46),
        child: Padding(
          padding: const EdgeInsets.all(80.0),
          child: Center(
            child: Container(color: Color.fromARGB(255, 228, 231, 224),
              child: Column(
                children: [
                  Container(
                    padding: EdgeInsets.all(12),
                    child: Text(
                      isEmpty
                          ? ''
                          : translate.translateString(lang,"Dernière connexion") + ": ${widget.connexionHistory[widget.connexionHistory.length - 1][0]}",
                      style: TextStyle(fontSize: 16),
                    ),
                  ),
                  Container(
                    padding: EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Text(
                          widget.userName,
                          style: TextStyle(fontSize: 26),
                        ),
                        Text(
                          "Points : ${widget.userPoints}",
                          style: TextStyle(fontSize: 18),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: EdgeInsets.all(20),
                    child:
                        Image.memory(widget.decodedBytes, height: 180, width: 180),
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
                        padding: const EdgeInsets.all(20.0),
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
                        padding: const EdgeInsets.all(20.0),
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
                    Container(
                      height: 400,
                      child: ConnectionHistoryList(connectionHistory: newList),
                    ),
                  if (showTableChart)
                    Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: StatsTable(
                        gamesPlayed: 10,
                        gamesWon: 7,
                        avgPointsPerGame: 25.6,
                        avgTimePerGame: Duration(minutes: 30),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
