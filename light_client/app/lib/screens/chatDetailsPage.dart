import 'package:app/main.dart';
import 'package:app/services/socket_client.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:app/models/chat_message_model.dart';
import 'package:app/widgets/chatList.dart';
import 'package:get_it/get_it.dart';

class ChatDetailPage extends StatefulWidget {
  @override
  _ChatDetailPageState createState() => _ChatDetailPageState();
}

class _ChatDetailPageState extends State<ChatDetailPage> {
  @override
  void initState() {
    super.initState();
    handleSockets();
  }

  List<ChatMessage> messages = [];
  final messageController = TextEditingController();
  final ScrollController scrollController = ScrollController();

  void handleSockets() {
    getIt<SocketService>().on("flutter", (_) {
      print("Adding message");
      setState(() {
        messages.add(ChatMessage(
            name: "Friend",
            messageContent: "Lets gooooo",
            isSender: false,
            time: DateFormat.jms().format(DateTime.now())));
      });
    });
  }

  void sendMessage(String message) {
    print("Adding message");
    setState(() {
      if (messageController.text.trim() == '') return;
      // Test de socket - mettre le socket chat
      getIt<SocketService>().send("flutter", null);
      messages.add(ChatMessage(
          name: "Rayan",
          messageContent: messageController.text,
          isSender: true,
          time: DateFormat.jms().format(DateTime.now())));
    });
    scrollDown();
    messageController.clear();
  }

  void scrollDown() {
    scrollController.animateTo(scrollController.position.maxScrollExtent,
        curve: Curves.linear, duration: const Duration(milliseconds: 1));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Text(
          "General",
          style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
        ),
      ),
      body: Stack(
        children: <Widget>[
          Container(
            child: ListView.builder(
              controller: scrollController,
              physics: BouncingScrollPhysics(),
              itemCount: messages.length,
              shrinkWrap: true,
              padding: EdgeInsets.only(top: 10, bottom: 80),
              itemBuilder: (context, index) {
                return ChatList(
                    name: messages[index].name,
                    messageContent: messages[index].messageContent,
                    isSender: messages[index].isSender,
                    time: messages[index].time);
              },
            ),
          ),
          Align(
            alignment: Alignment.bottomLeft,
            child: Container(
              padding: EdgeInsets.only(left: 10, bottom: 10, top: 10),
              color: Colors.white,
              child: Row(
                children: <Widget>[
                  Expanded(
                    child: TextField(
                      textInputAction: TextInputAction.send,
                      onSubmitted: (value) {
                        sendMessage(value);
                      },
                      controller: messageController,
                      decoration: InputDecoration(
                          hintText: "Écris un message ...",
                          hintStyle: TextStyle(color: Colors.black54),
                          border: OutlineInputBorder(),
                          suffixIcon: IconButton(
                            icon: Icon(Icons.clear),
                            onPressed: () {
                              messageController.clear();
                            },
                          )),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: FloatingActionButton(
                      onPressed: () {
                        sendMessage(messageController.text);
                      },
                      child: Icon(
                        Icons.send,
                        color: Colors.white,
                        size: 25,
                      ),
                      backgroundColor: Colors.blue,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
