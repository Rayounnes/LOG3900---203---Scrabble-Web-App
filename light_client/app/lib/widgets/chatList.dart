import 'package:flutter/material.dart';

class ChatList extends StatefulWidget {
  String name;
  String messageContent;
  bool isSender;
  String time;
  ChatList({
    required this.name,
    required this.messageContent,
    required this.isSender,
    required this.time,
  });
  @override
  _ChatListState createState() => _ChatListState();
}

class _ChatListState extends State<ChatList> {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(left: 14, right: 14, top: 10, bottom: 10),
      child: Card(
        color: widget.isSender ? Colors.blue[200] : Colors.grey.shade200,
        child: ListTile(
          leading: Text(widget.time),
          title: Text(widget.name),
          subtitle: Text(
            widget.messageContent,
            style: TextStyle(fontSize: 18),
          ),
          isThreeLine: true,
        ),
      ),
    );
  }
}
