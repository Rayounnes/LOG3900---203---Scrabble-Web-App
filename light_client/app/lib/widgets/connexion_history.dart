import 'dart:core';
import 'package:flutter/material.dart';

import '../services/translate_service.dart';

class ConnectionHistoryList extends StatefulWidget {
  final List<String> connectionHistory;
  final List<String> deconnectionHistory;
  final List gameHistory;

  const ConnectionHistoryList(
      {super.key,
      required this.connectionHistory,
      required this.deconnectionHistory,
      required this.gameHistory});

  @override
  _ConnectionHistoryListState createState() => _ConnectionHistoryListState();
}

class _ConnectionHistoryListState extends State<ConnectionHistoryList> {
  String lang = "en";
  TranslateService translate = TranslateService();
  final List<String> newList = [];

  @override
  void initState() {
    super.initState();
    fillHistoryList();
  }

  void fillHistoryList() {
    for (int i=0; i< widget.gameHistory.length; i++) {
      String res = translate.translateString(
          lang,"Partie perdue");
      if(widget.gameHistory[i][1]) {
        res = translate.translateString(lang,"Partie gagnée");
      }
      newList.add("${widget.gameHistory[i][0]} \n$res");
    }
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      initialIndex: 0,
      child: Scaffold(
        appBar: AppBar(toolbarHeight: 20,
          automaticallyImplyLeading: false,
          bottom: TabBar(
            tabs: [
              Tab(
                key: Key("Connexions"),
                text: translate.translateString(
                    lang, 'Historique des connexions'),
              ),
              Tab(
                key: Key("Déconnexions"),
                text: translate.translateString(
                    lang, 'Historique des déconnexions'),
              ),
              Tab(
                key: Key("Games"),
                text: translate.translateString(lang, 'Historique des parties'),
              ),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            buildTabView(context, widget.connectionHistory),
            buildTabView(context, widget.connectionHistory),
            buildTabView(context, newList),
          ],
        ),
      ),
    );
  }

  Widget buildTabView(BuildContext context, List<String> data) {
    return Scrollbar(
      thickness: 10,
      // thumbVisibility: true,
      child: ListView.builder(
        itemCount: data.length,
        itemBuilder: (BuildContext context, int index) {
          return ListTile(
            tileColor: Colors.grey[300],
            textColor: Color.fromARGB(255, 10, 26, 94),
            title: Text(data[index]),
          );
        },
      ),
    );
  }
}
