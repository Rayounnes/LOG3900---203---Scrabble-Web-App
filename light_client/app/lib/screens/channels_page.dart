

import 'package:app/screens/chat_page.dart';
import 'package:flutter/material.dart';
import 'package:app/widgets/channel.dart';
import 'package:app/widgets/button.dart';
import 'package:app/main.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/services/api_service.dart';

class Channels extends StatefulWidget {
  const Channels({super.key});

  @override
  State<Channels> createState() => _ChannelsState();
}

class _ChannelsState extends State<Channels> {
  @override
  void initState() {
    super.initState();
    handleSockets();
    
  }

  List<String> discussions = ["General"];
  final nameController = TextEditingController(text: "Nouvelle discussion");
  var chatDeleted = '';

  handleSockets() async{
    ApiService().getAllChannels().then((response) {
      print(response); // affiche la réponse de la requête HTTP
      }).catchError((error) {
      print('Error fetching channels: $error');
      });

  }

  @override
  Widget build(BuildContext context) {
    
    return SingleChildScrollView(
      physics: BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SafeArea(
            child: Padding(
              padding: EdgeInsets.only(left: 16, right: 16, top: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: <Widget>[
                  Text(
                    "Conversations",
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                  )
                ],
              ),
            ),
          ),
          ListView.separated(
              itemCount: discussions.length,
              shrinkWrap: true,
              padding: EdgeInsets.all(16),
              physics: BouncingScrollPhysics(),
              itemBuilder: (context, index) {
                return Channel(name: discussions[index]);
              },
              separatorBuilder: (context, index) => SizedBox(
                    height: 10,
                  )),
                ListTile(
                  title: Row(
                  children: <Widget>[
                  Expanded(child: GameButton(
                    padding: 32.0,
                    route: () {
                    showModalAdd(context);
                      }, 
                    name: "Créer un chat",
                    )),
                    Expanded(child: GameButton(
                    padding: 32.0,
                    route: () {
                    showModalDelete(context);
                      }, 
                    name: "Supprimer un chat ",
                    )),
                    Expanded(child: GameButton(
                    padding: 32.0,
                    route: () {
                      }, 
                    name: "Rechercher un chat",
                    ))
            ],
          ),
        )                  
        ],
      ),
    );
  }


  void showModalAdd(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) => AlertDialog(
        title: Text('Créer un nouveau chat'),
        content: Container(
          height: 150,
          child: Form(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    "Nom du chat",
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(8.0),
                  child: TextFormField(
                    controller: nameController,
                  )
                )
              ],
            ),
          ),
        ),
        actions: <ElevatedButton>[
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: Text(
              "Annuler",
            ),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                discussions.add(nameController.text);
              });
              Navigator.of(context).pop();
              // getIt<SocketService>().send("create-chat", nameController.text);
            },
            child: Text(
              "Créer le chat",
            ),
          )
        ],
      ),
    );
  }


  void showModalDelete(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) => AlertDialog(
        title: Text('Supprimer un chat'),
        content: Container(
          height: 150,
          child: Form(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
               Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    "Choisissez un chat à supprimer",
                  ),
                ),
                DropdownButtonFormField(
                    validator: (value) => value == null
                        ? "Veuillez choisir le chat à supprimer"
                        : null,
                    value: discussions[0],
                    onChanged: (String? newValue) {
                      setState(() {
                        chatDeleted = newValue!;
                      });
                    },
                    items: discussions.map((discussion) {
                    return DropdownMenuItem(
                    value: discussion,
                    child: Text(discussion),
                    );
                    }).toList(),)
              ],
            ),
          ),
        ),
        actions: <ElevatedButton>[
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: Text(
              "Annuler",
            ),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                if(chatDeleted != 'General') {
                  discussions.remove(chatDeleted);
                } 
              });
              print(discussions);
              Navigator.of(context).pop();
              // getIt<SocketService>().send("create-chat", nameController.text);
            },
            child: Text(
              "Supprimer le chat",
            ),
          )
        ],
      ),
    );
  }
}
