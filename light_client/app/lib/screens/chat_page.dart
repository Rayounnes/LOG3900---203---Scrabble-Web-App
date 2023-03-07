import 'package:app/main.dart';
import 'package:app/services/socket_client.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:app/models/chat_message_model.dart';
import 'package:app/widgets/chat_message.dart';
import 'package:app/services/user_infos.dart';

class ChatPage extends StatefulWidget {
  final String discussion;
  
  const ChatPage({super.key, required this.discussion});

  @override
  _ChatPageState createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  @override
  void initState() {
    super.initState();
    handleSockets();
  }

  @override
  void dispose() {
    messageController.dispose();
    scrollController.dispose();
    super.dispose();
  }

  String username = getIt<UserInfos>().user;
  List<ChatMessage> messages = [];
  String currentChat = '';
  final messageController = TextEditingController();
  final ScrollController scrollController = ScrollController();

  void handleSockets() async {
    getIt<SocketService>().on('chatMessage', (chatMessage) {
      print('dans la socket on');
      print(chatMessage);
      try {
        if (mounted) {
          setState(() {
            messages.add(ChatMessage.fromJson(chatMessage));
            scrollDown();
          });
        }
      } catch (e) {
        print(e);
      }
    });
  }

  void sendMessage(String message) {
    if (messageController.text.trim().isEmpty) return;
    final message = ChatMessage(
        username: username,
        type: "player",
        message: messageController.text,
        time: DateFormat.Hms().format(DateTime.now()),
        channel: widget.discussion);
    print('dnas la socket send');
    print(message.channel);
    getIt<SocketService>().send('chatMessage', message);
    messageController.clear();
  }

  void scrollDown() {
    scrollController.jumpTo(scrollController.position.maxScrollExtent + 25);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.lightBlue,
        title: Text(
          widget.discussion,
          style: TextStyle(fontSize: 25, fontWeight: FontWeight.bold),
        ),
      ),
      body: Column(
        children: <Widget>[
          Expanded(
            child: ListView.builder(
              controller: scrollController,
              physics: BouncingScrollPhysics(),
              itemCount: messages.length,
              shrinkWrap: true,
              padding: EdgeInsets.only(top: 10, bottom: 80),
              itemBuilder: (context, index) {
                  return Message(
                    name: messages[index].username,
                    messageContent: messages[index].message,
                    isSender: messages[index].username == username,
                    time: messages[index].time,
                    );
              },
            ),
          ),
          Align(
            alignment: Alignment.topLeft,
            child:Row(children: [
            SizedBox(width: 50), // un espace vide pour séparer les boutons
              TextButton(
                onPressed: () {
                  messageController.text = 'Salut!';
                  sendMessage(messageController.text);
                  // action à effectuer lorsqu'on appuie sur le bouton 1
                },
                child: Text('Salut!'),
              ),
        SizedBox(width: 50), // un espace vide pour séparer les boutons
              TextButton(
                onPressed: () {
                  messageController.text = 'Bien joué!';
                  sendMessage(messageController.text);// action à effectuer lorsqu'on appuie sur le bouton 2
                },
                child: Text('Bien joué!')),
         SizedBox(width: 50), // un espace vide pour séparer les boutons
              TextButton(
                onPressed: () {
                  messageController.text = 'Nul!';
                  sendMessage(messageController.text); // action à effectuer lorsqu'on appuie sur le bouton 2
                },
                child: Text('Nul!')),
          SizedBox(width: 50), // un espace vide pour séparer les boutons
              TextButton(
                onPressed: () {
                  messageController.text = 'Wow!';
                  sendMessage(messageController.text); 
                  // action à effectuer lorsqu'on appuie sur le bouton 2
                },
                child: Text('Wow!')),
          SizedBox(width: 50), // un espace vide pour séparer les boutons
              TextButton(
                onPressed: () {
                  messageController.text = 'Bonne chance!';
                  sendMessage(messageController.text); 
                  // action à effectuer lorsqu'on appuie sur le bouton 2
                },
                child: Text('Bonne chance!')),
          SizedBox(width: 50), // un espace vide pour séparer les boutons
              TextButton(
                onPressed: () {
                  messageController.text = 'Oh non!';
                  sendMessage(messageController.text); 
                  // action à effectuer lorsqu'on appuie sur le bouton 2
                },
                child: Text('Oh non!')),
                  
                ],),

                ),
           



          Align(
  alignment: Alignment.bottomLeft,
  child: Container(
    padding: EdgeInsets.only(left: 10, bottom: 10, top: 10),
    color: Colors.white,

    child: Row(
      
      children: <Widget>[
         SizedBox(width: 10), // un espace vide pour séparer les boutons
        
        Expanded(
          child: TextField(
            textInputAction: TextInputAction.send,
            onSubmitted: (value) {
              FocusManager.instance.primaryFocus?.requestFocus();
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
              ),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: FloatingActionButton(
            onPressed: () {
              print(messages);
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
