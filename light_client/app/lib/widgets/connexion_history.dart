import 'dart:core';
import 'package:flutter/material.dart';

class ConnectionHistoryList extends StatefulWidget {
  final List<String> connectionHistory;

  const ConnectionHistoryList({super.key, required this.connectionHistory});

  @override
  _ConnectionHistoryListState createState() => _ConnectionHistoryListState();
}

class _ConnectionHistoryListState extends State<ConnectionHistoryList> {
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      initialIndex: 0,
      child: Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          bottom: TabBar(
            tabs: [
              Tab(key: Key("Connexions"),
                text: 'Historique des connexions',
              ),
              Tab(key: Key("Déconnexions"),
                text: 'Historique des déconnexions',
              ),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            buildTabView(context, widget.connectionHistory),
            buildTabView(context, widget.connectionHistory),
          ],
        ),
      ),
    );
  }

  Widget buildTabView(BuildContext context, List<String> data) {
    return Container(
      height: 330,
      width: 250,
      child: Scrollbar(
        thickness: 10,
        thumbVisibility: true,
        child: ListView.builder(
          itemCount: data.length,
          itemBuilder: (BuildContext context, int index) {
            return ListTile(
              title: Text(data[index]),
            );
          },
        ),
      ),
    );
  }
}
