import 'dart:core';
import 'dart:typed_data';

import 'package:app/screens/user_account_edit_page.dart';
import 'package:flutter/material.dart';

import '../main.dart';
import '../models/personnalisation.dart';
import '../services/socket_client.dart';


class UserAccountPage extends StatefulWidget {
  final String userName ;
  final int userPoints ;
  final Uint8List decodedBytes;
  final List<dynamic> connexionHistory;

  const UserAccountPage({super.key, required this.userName,required this.userPoints, required this.connexionHistory, required this.decodedBytes});

  @override
  _UserAccountPageState createState() => _UserAccountPageState();
}

class _UserAccountPageState extends State<UserAccountPage> {
  List<String> newList = [];
  bool isShow = false;
  bool isEmpty = true;


  @override
  void initState() {
    super.initState();
    fillHistoryLit();
  }

  @override
  void dispose() {
    super.dispose();
  }

  void fillHistoryLit(){
    for(var element in widget.connexionHistory){
      newList.add(element[0]);
      isEmpty = false;
    }
  }

  @override
  Widget build(BuildContext context) {
      return Scaffold(
        appBar: AppBar(
            title: Text(
              'Mon compte',
            ),),
        body:Padding(
          padding: const EdgeInsets.all(80.0),
          child: Center(
            child: Column(
              children: [
                Container(
                  padding: EdgeInsets.all(12),
                  child: Text(isEmpty? '':
                      "Dernière connexion : ${widget.connexionHistory[widget.connexionHistory.length-1][0]}",
                    style: TextStyle(fontSize: 16),),

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
                  child: Image.memory(widget.decodedBytes, height:180 ,width: 180),
                ),
                Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => UserAccountEditPage(username: widget.userName),
                        ),
                      );
                    },
                    child: Icon(Icons.mode_edit),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ElevatedButton(
                        onPressed: () {
                          setState(() {
                            isShow = !isShow;
                          });
                        },
                        child: Icon(Icons.history,color: isShow?Color.fromARGB(
                            255, 173, 169, 80): Color.fromARGB(
                            255, 30, 61, 103)),
                      ),
                    ],
                  ),
                ),
                if(isShow) Padding(
                  padding: const EdgeInsets.only(top:20.0),
                  child: Container(
                    height: 400,
                    child: ConnectionHistoryList(connectionHistory: newList),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }
}

class ConnectionHistoryList extends StatefulWidget {
  final List<String> connectionHistory ;
  const ConnectionHistoryList({super.key, required this.connectionHistory});
  @override
  _ConnectionHistoryListState createState() => _ConnectionHistoryListState();
}

class _ConnectionHistoryListState extends State<ConnectionHistoryList> {
  late Personnalisation langOrTheme;


  @override
  void initState() {
    super.initState();
    handleSockets();

  }

    void handleSockets(){
    getIt<SocketService>().on("get-theme-language", (value) {
      langOrTheme = value;
    });
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
          body: Center(
            child: Column(
              children: [
                Text("Historique des connexions",style: TextStyle(fontSize: 18,fontWeight: FontWeight.w800)),
                SizedBox(height: 20,width: 20,),
                Center(
                  child: Container(
                    height: 330,
                    width: 250,
                    child: Scrollbar(thickness:10,thumbVisibility: true,
                      child: ListView.builder(
                        itemCount: widget.connectionHistory.length,
                        itemBuilder: (BuildContext context, int index) {
                          return ListTile(
                            title: Text(widget.connectionHistory[index]),
                          );
                        },
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
  }
}



