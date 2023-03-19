import 'package:app/main.dart';
import 'package:app/services/socket_client.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:app/models/chat_message_model.dart';
import 'package:app/widgets/chat_message.dart';
import 'package:app/services/user_infos.dart';
import 'package:app/services/api_service.dart';


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
    userTyping = "";
    countUsersTyping = 0;
    

    
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
  bool isTyping = false;
  String userTyping = "";
  int countUsersTyping = 0;
  List<String> usersTyping = [];
  final messageController = TextEditingController();
  final ScrollController scrollController = ScrollController();

  void handleSockets() async {
    ApiService().getMessagesOfChannel(widget.discussion).then((response) {
      print(widget.discussion);


    ApiService().getUserChannels(username).then((response) {
    }).catchError((error) {
    print('Error fetching channels: $error');
    });
      
      
      setState(() {
      if(widget.discussion == 'General') {
        response.remove(120);
        response.removeAt(49);
        response.removeAt(0);

      }

      for (dynamic res in response) {
      ChatMessage message = ChatMessage.fromJson(res);
      messages.add(message);
    }
        
      });
    
      }).catchError((error) {
      print('Error fetching channels: $error');
      });


    getIt<SocketService>().on('chatMessage', (chatMessage) {
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

    getIt<SocketService>().on('isTypingMessage', (message) {
      try {
        if (mounted) {
          setState(() {
        

          if(message['channel'] == widget.discussion) {
          isTyping = true;
          countUsersTyping = countUsersTyping + 1;
          userTyping = message['player'];
          usersTyping.add(userTyping);
          
          }

        
          });
        }
      } catch (e) {
        print(e);
      }
    });


     getIt<SocketService>().on('isNotTypingMessage', (message) {
      try {
        if (mounted) {
          setState(() {
            if(message['channel'] == widget.discussion) {

              countUsersTyping = countUsersTyping - 1;
              usersTyping.remove(message['player']);
              if(usersTyping.isNotEmpty) {
                 userTyping = usersTyping[0];
              }
              else{
                userTyping ="";
              }
              if(countUsersTyping>0) {
                isTyping = true;
              }
              else {
                isTyping = false;
              }
            

              }
          
           
          });
        }
      } catch (e) {
        print(e);
      }
    });
  }


  void sendUserIsTyping() {
    final message = ChatMessage(
      username: username, 
      message: 'typing', 
      time: DateFormat.Hms().format(DateTime.now()), 
      type: 'player');
      getIt<SocketService>().send('isTypingMessage', message);
  }

  void sendUserIsNotTyping() {
    final message = ChatMessage(
      username: username, 
      message: '', 
      time: DateFormat.Hms().format(DateTime.now()), 
      type: 'player');
      getIt<SocketService>().send('isTypingMessage', message);
  }

  void sendMessage(String message) {
    if (messageController.text.trim().isEmpty) return;
    final message = ChatMessage(
        username: username,
        type: "player",
        message: messageController.text,
        time: DateFormat.Hms().format(DateTime.now()),
        channel: widget.discussion);
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

          if (isTyping && countUsersTyping>1) // afficher le texte seulement lorsque isTyping est vrai
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Text(
              "Plusieurs joueurs sont en train d'écrire ...",
              style: TextStyle(fontStyle: FontStyle.italic),
            ),
          ),
          if (isTyping && countUsersTyping == 1)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Text(
              userTyping + " est en train d'écrire ...",
              style: TextStyle(fontStyle: FontStyle.italic),
            ),
          ),

          Align(
            alignment: Alignment.topLeft,
            child:Row(children: [
            SizedBox(width: 50), 
              TextButton(
                onPressed: () {
                  messageController.text = 'Salut!';
                  sendMessage(messageController.text);
                },
                child: Text('Salut!'),
              ),
        SizedBox(width: 50), 
              TextButton(
                onPressed: () {
                  messageController.text = 'Bien joué!';
                  sendMessage(messageController.text);
                },
                child: Text('Bien joué!')),
         SizedBox(width: 50), 
              TextButton(
                onPressed: () {
                  messageController.text = 'Nul!';
                  sendMessage(messageController.text); 
                },
                child: Text('Nul!')),
          SizedBox(width: 50),
              TextButton(
                onPressed: () {
                  messageController.text = 'Wow!';
                  sendMessage(messageController.text); 
                },
                child: Text('Wow!')),
          SizedBox(width: 50), 
              TextButton(
                onPressed: () {
                  messageController.text = 'Bonne chance!';
                  sendMessage(messageController.text); 
                  
                },
                child: Text('Bonne chance!')),
          SizedBox(width: 50),
              TextButton(
                onPressed: () {
                  messageController.text = 'Oh non!';
                  sendMessage(messageController.text); 
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
            onChanged: (value) {
              if (value.isNotEmpty) {
                sendUserIsTyping();
            }
              else {
                sendUserIsNotTyping();
              }

            } ,
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
