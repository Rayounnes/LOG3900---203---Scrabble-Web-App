import 'package:app/main.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/services/translate_service.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:app/models/chat_message_model.dart';
import 'package:app/widgets/chat_message.dart';
import 'package:app/services/user_infos.dart';
import 'package:app/services/api_service.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart'
    hide Message;

import '../constants/widgets.dart';

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
    initNotifications();
    getConfigs();
    handleSockets();
  }

  getConfigs() {
    getIt<SocketService>().send("get-config");
  }

  @override
  void dispose() {
    print("dispose chat called");
    getIt<SocketService>().userSocket.off('chatMessage');
    getIt<SocketService>().userSocket.off('isTypingMessage');
    getIt<SocketService>().userSocket.off("change-username");
    getIt<SocketService>().userSocket.off("isNotTypingMessage");
    getIt<SocketService>().userSocket.off('get-configs');
    messageController.dispose();
    scrollController.dispose();
    super.dispose();
  }

  String username = getIt<UserInfos>().user;
  List<ChatMessage> messages = [];
  String currentChat = '';
  bool isTyping = false;
  bool isTypingSend = false;
  String userTyping = "";
  int countUsersTyping = 0;
  List<String> usersTyping = [];
  String avatar = "";
  final messageController = TextEditingController();
  final ScrollController scrollController = ScrollController();
  FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();
  String lang = "en";
  String theme = 'white';
  TranslateService translate = new TranslateService();

  void initNotifications() async {
    var initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    var initializationSettings =
        InitializationSettings(android: initializationSettingsAndroid);
    await flutterLocalNotificationsPlugin.initialize(initializationSettings);
  }

  void showNotification(String message, String channel) async {
    var androidDetails = AndroidNotificationDetails(
        'channel_id', 'Channel Name',
        importance: Importance.max,
        priority: Priority.high,
        showWhen: false,
        color: Color(0xFF2196F3));

    var notificationDetails = NotificationDetails(android: androidDetails);

    await flutterLocalNotificationsPlugin.show(
        0,
        translate.translateString(lang, 'Nouveau message dans') + '$channel',
        message,
        notificationDetails);
  }

  getMessageOfChannel() {
    ApiService().getMessagesOfChannel(widget.discussion).then((response) {
      //print(widget.discussion);

      ApiService()
          .getUserChannels(username)
          .then((response) {})
          .catchError((error) {
        print('Error fetching channels: $error');
      });

      setState(() {
        messages = [];
        for (dynamic res in response) {
          ChatMessage message = ChatMessage.fromJson(res);
          messages.add(message);
        }
      });
    }).catchError((error) {
      print('Error fetching channels: $error');
    });
  }

  void handleSockets() async {
    ApiService().getMessagesOfChannel(widget.discussion).then((response) {
      ApiService()
          .getUserChannels(username)
          .then((response) {})
          .catchError((error) {
        print('Error fetching channels: $error');
      });

      setState(() {
        for (dynamic res in response) {
          ChatMessage message = ChatMessage.fromJson(res);
          messages.add(message);
        }
      });
    }).catchError((error) {
      print('Error fetching channels: $error');
    });

    getIt<SocketService>().on("notify-message", (message) async {
      try {
        if (mounted) {
          if (message['channel'] == widget.discussion) {
            getIt<SocketService>()
                .send("notification-received", (message['channel']));
          }
          if (message['channel'] != widget.discussion) {
            showNotification(message['message'], message['channel']);
          }
        }
      } catch (e) {
        print(e);
      }
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
            if (message['channel'] == widget.discussion &&
                message['player'] != username) {
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

    getIt<SocketService>().on('change-username', (infos) {
      try {
        print("$infos CHANGE USER \n id");
        print(getIt<SocketService>().socketId);
        if (infos['id'] == getIt<SocketService>().socketId) {
          username = infos['username'];
          getIt<UserInfos>().setUser(infos['username']);
        }
        getMessageOfChannel();
      } catch (e) {
        print("FAILED USERCHANGE");
      }
    });

    getIt<SocketService>().on('icon-change', (infos) {
      try {
        getMessageOfChannel();
      } catch (e) {
        print("FAILED ICONCHANGE");
      }
    });

    getIt<SocketService>().on('isNotTypingMessage', (message) {
      try {
        if (mounted) {
          setState(() {
            if (message['channel'] == widget.discussion &&
                message['player'] != username) {
              countUsersTyping = countUsersTyping - 1;
              usersTyping.remove(message['player']);
              if (usersTyping.isNotEmpty) {
                userTyping = usersTyping[0];
              } else {
                userTyping = "";
              }
              if (countUsersTyping > 0) {
                isTyping = true;
              } else {
                isTyping = false;
              }
            }
          });
        }
      } catch (e) {
        print(e);
      }
    });

    getIt<SocketService>().on("get-config", (value) {
      lang = value['langue'];
      theme = value['theme'];
      if (mounted) {
        setState(() {
          lang = value['langue'];
          theme = value['theme'];
        });
      }
    });
  }

  void sendUserIsTyping() {
    final message = ChatMessage(
        username: username,
        message: 'typing',
        time: DateFormat.Hms().format(DateTime.now()),
        type: 'player',
        channel: widget.discussion);
    getIt<SocketService>().send('isTypingMessage', message);
  }

  void sendUserIsNotTyping() {
    final message = ChatMessage(
        username: username,
        message: '',
        time: DateFormat.Hms().format(DateTime.now()),
        type: 'player',
        channel: widget.discussion);
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
    sendUserIsNotTyping();
    isTypingSend = false;
    messageController.clear();
  }

  void scrollDown() {
    scrollController.jumpTo(scrollController.position.maxScrollExtent + 25);
  }

  Future<String> avatarUser(String username) async {
    List iconList = []; // declare iconList before using it
    iconList = await ApiService().getUserIcon(username);
    return iconList[0].toString().substring(BASE64PREFIX.length);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: theme == "dark" ? Colors.grey : Colors.white,
      appBar: AppBar(
        backgroundColor: theme == "dark"
            ? Color.fromARGB(255, 107, 105, 105)
            : Color.fromARGB(255, 236, 198, 198),
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
                if (messages[index].channel == widget.discussion) {
                  return Message(
                      name: messages[index].username,
                      messageContent: messages[index].message,
                      isSender: messages[index].username == username,
                      time: messages[index].time,
                      avatar: avatarUser(messages[index].username));
                }
              },
            ),
          ),
          if (isTyping &&
              countUsersTyping >
                  1) // afficher le texte seulement lorsque isTyping est vrai
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: Text(
                translate.translateString(
                    lang, "Plusieurs joueurs sont en train d'écrire ..."),
                style: TextStyle(fontStyle: FontStyle.italic),
              ),
            ),
          if (isTyping && countUsersTyping == 1)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: Text(
                userTyping +
                    translate.translateString(
                        lang, " est en train d'écrire ..."),
                style: TextStyle(fontStyle: FontStyle.italic),
              ),
            ),
          Align(
            alignment: Alignment.topLeft,
            child: Row(
              children: [
                SizedBox(width: 50),
                TextButton(
                  onPressed: () {
                    messageController.text =
                        translate.translateString(lang, 'Salut!');
                    sendMessage(messageController.text);
                  },
                  child: Text('Salut!'),
                ),
                SizedBox(width: 50),
                TextButton(
                    onPressed: () {
                      messageController.text =
                          translate.translateString(lang, 'Bien joué!');
                      sendMessage(messageController.text);
                    },
                    child: Text(translate.translateString(lang, 'Bien joué!'))),
                SizedBox(width: 50),
                TextButton(
                    onPressed: () {
                      messageController.text =
                          translate.translateString(lang, 'Nul!');
                      sendMessage(messageController.text);
                    },
                    child: Text(translate.translateString(lang, 'Nul!'))),
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
                      messageController.text =
                          translate.translateString(lang, 'Bonne chance!');
                      sendMessage(messageController.text);
                    },
                    child: Text('Bonne chance!')),
                SizedBox(width: 50),
                TextButton(
                    onPressed: () {
                      messageController.text =
                          translate.translateString(lang, 'Oh non!');
                      sendMessage(messageController.text);
                    },
                    child: Text('Oh non!')),
              ],
            ),
          ),
          Align(
            alignment: Alignment.bottomLeft,
            child: Container(
              padding: EdgeInsets.only(left: 10, bottom: 10, top: 10),
              color: theme == "dark" ? Colors.grey : Colors.white,
              child: Row(
                children: <Widget>[
                  SizedBox(width: 10),
                  // un espace vide pour séparer les boutons

                  Expanded(
                    child: TextField(
                      textInputAction: TextInputAction.send,
                      onSubmitted: (value) {
                        FocusManager.instance.primaryFocus?.requestFocus();
                        sendMessage(value);
                      },
                      controller: messageController,
                      onChanged: (value) {
                        print("OOOOOOOOOO");
                        print(value.isNotEmpty);

                        if (value.isNotEmpty && !isTypingSend) {
                          isTypingSend = true;
                          sendUserIsTyping();
                        } else if (!value.isNotEmpty && isTypingSend) {
                          isTypingSend = false;
                          sendUserIsNotTyping();
                        } else {}
                      },
                      decoration: InputDecoration(
                        fillColor: theme == "dark"
                            ? Color.fromARGB(255, 177, 176, 176)
                            : Colors.white,
                        filled: true,
                        hintText: translate.translateString(
                            lang, "Écris un message ..."),
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
                        //print(messages);
                        sendMessage(messageController.text);
                      },
                      backgroundColor: Colors.blue,
                      child: Icon(
                        Icons.send,
                        color: Colors.white,
                        size: 25,
                      ),
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
