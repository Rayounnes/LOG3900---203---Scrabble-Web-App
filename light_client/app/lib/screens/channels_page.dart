import 'package:app/screens/chat_page.dart';
import 'package:flutter/material.dart';
import 'package:app/widgets/channel.dart';

class Channels extends StatefulWidget {
  const Channels({super.key});

  @override
  State<Channels> createState() => _ChannelsState();
}

class _ChannelsState extends State<Channels> {
  List<String> discussions = ["General"];

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
                //    ElevatedButton(
                //     style: ElevatedButton.styleFrom(
                //     padding: EdgeInsets.symmetric(horizontal: 50, vertical: 20),
                //     ),
                //     child: Text('Créer un chat +'),
                //     onPressed: () {
                //   },
                  
                // ),
                //  ElevatedButton(
                //     style: ElevatedButton.styleFrom(
                //     padding: EdgeInsets.symmetric(horizontal: 50, vertical: 20),
                //     ),
                //     child: Text('Supprimer un chat -'),
                //     onPressed: () {
                //   }),
                ListTile(
                title: Row(
                children: <Widget>[
                Expanded(child: ElevatedButton(onPressed: () {}, child: Text("Créer un chat + "),)),
                Expanded(child: ElevatedButton(onPressed: () {}, child: Text("Supprimer un chat -"))),
                Expanded(child: ElevatedButton(onPressed: () {}, child: Text("Rechercher un chat"))),
            ],
          ),
        )



                  
        ],
      ),
    );
  }
}
