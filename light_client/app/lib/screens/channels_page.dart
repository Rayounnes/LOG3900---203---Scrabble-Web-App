import 'package:app/screens/chat_page.dart';
import 'package:flutter/material.dart';
import 'package:app/widgets/channel.dart';
import 'package:app/widgets/button.dart';

class Channels extends StatefulWidget {
  const Channels({super.key});

  @override
  State<Channels> createState() => _ChannelsState();
}

class _ChannelsState extends State<Channels> {
  List<String> discussions = ["General"];
  final nameController = TextEditingController(text: "Nouvelle discussion");

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
                    showModal(context);
                      }, 
                    name: "Créer un chat + ",
                    )),
                  Expanded(child: ElevatedButton(onPressed: () {}, child: Text("Supprimer un chat -"))),
                  Expanded(child: ElevatedButton(onPressed: () {}, child: Text("Rechercher un chat"))),
            ],
          ),
        )                  
        ],
      ),
    );
  }


  void showModal(BuildContext context) {
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
              discussions.add(nameController.text);
            },
            child: Text(
              "Créer le chat",
            ),
          )
        ],
      ),
    );
  }
}
