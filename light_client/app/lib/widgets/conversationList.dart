import 'package:flutter/material.dart';
import 'package:app/screens/chatDetailsPage.dart';

class ConversationList extends StatefulWidget {
  String name;
  ConversationList(
      {required this.name});
  @override
  _ConversationListState createState() => _ConversationListState();
}

class _ConversationListState extends State<ConversationList> {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
        onTap: () {
          Navigator.push(context, MaterialPageRoute(builder: (context) {
            return ChatDetailPage();
          }));
        },
        child: Container(
          decoration: BoxDecoration(
            color: Colors.blue[200],
            borderRadius: BorderRadius.circular(8),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: <Widget>[
                Icon(Icons.chat_bubble),
                SizedBox(
                  width: 20,
                ),
                Text(
                  widget.name,
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                )
              ],
            ),
          ),
        ));
  }
}
