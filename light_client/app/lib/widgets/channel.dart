import 'package:app/widgets/parent_widget.dart';
import 'package:flutter/material.dart';
import 'package:app/screens/chat_page.dart';
import 'package:app/screens/channels_page.dart';


class Channel extends StatefulWidget {
  String name;
  final Function updateMessageState;
  Channel(
      {required this.name, required this.updateMessageState});
  @override
  _ChannelState createState() => _ChannelState();
}

class _ChannelState extends State<Channel> {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
        onTap: () {
          widget.updateMessageState();
          Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => ChatPage(discussion: widget.name),
                  
                ),
                
              );
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
                ),

              ],
            ),
          ),
        ));
  }
}
