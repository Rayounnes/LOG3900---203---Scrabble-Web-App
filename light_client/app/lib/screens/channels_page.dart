import 'package:app/models/personnalisation.dart';
import 'package:flutter/material.dart';
import 'package:app/widgets/channel.dart';
import 'package:app/widgets/button.dart';
import 'package:app/main.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/services/api_service.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../services/translate_service.dart';

import '../models/placement.dart';

class Channels extends StatefulWidget {
  const Channels({super.key});

  @override
  State<Channels> createState() => _ChannelsState();
}

class _ChannelsState extends State<Channels> {
  @override
  void initState() {
    super.initState();
    getConfigs();
    handleSockets();
    initNotifications();
  }

  @override
  void dispose() {
    print("dispose channels called");
    getIt<SocketService>().userSocket.off('sendUsername');
    getIt<SocketService>().userSocket.off('channel-created');
    getIt<SocketService>().userSocket.off("leave-channel");
    getIt<SocketService>().userSocket.off("channels-joined");
    getIt<SocketService>().userSocket.off('get-configs');
    super.dispose();
  }

  getConfigs() {
    getIt<SocketService>().send("get-config");
  }

  List<String> discussions = ["General"];
  List<dynamic> allChannelsDB = [];
  List<dynamic> allUsersChannels = [];
  List<String> selectedList = [];
  int count = -1;
  int countJoin = 0;
  // late Personnalisation langOrTheme;
  String lang = "en";
  TranslateService translate = new TranslateService();

  List<dynamic> channelsUsers = [];
  var nameController = TextEditingController(text: "");

  List<bool> newMessage = [false];

  String chatDeleted = '';
  String chatJoined = '';
  String usernameMain ='';
  FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();


  void initNotifications() async {
  var initializationSettingsAndroid =AndroidInitializationSettings('@mipmap/ic_launcher');
  var  initializationSettings = InitializationSettings(android: initializationSettingsAndroid);
  await flutterLocalNotificationsPlugin.initialize(initializationSettings);

  
  }


  void showNotification(String message, String channel) async {
    var androidDetails = AndroidNotificationDetails('channel_id', 'Channel Name',
    importance: Importance.max, priority: Priority.high, showWhen: false, color:Color(0xFF2196F3));

    var notificationDetails = NotificationDetails(android: androidDetails);

    await flutterLocalNotificationsPlugin.show(
    0, translate.translateString(lang, 'Nouveau message dans ')+ '$channel', message, notificationDetails);
}

  handleSockets() async {
    ApiService().getAllChannels().then((response) {
      allChannelsDB = response;
    }).catchError((error) {
      print('Error fetching channels: $error');
    });

    ApiService().getAllUsers().then((response) {
      allUsersChannels = response;
    }).catchError((error) {
      print('Error fetching channels: $error');
    });

    getIt<SocketService>().on("sendUsername", (username) async {
      usernameMain = username;
      ApiService().getChannelsOfUsers(username).then((response) {
        channelsUsers = response;
        setState(() {
          discussions = ["General"];
          for (String channel in channelsUsers) {
            if (channel != "General") {
              discussions.add(channel);
              newMessage.add(false);
            }
          }
        });
      }).catchError((error) {
        print('Error fetching channels: $error');
      });
    });

    getIt<SocketService>().on("channel-created", (channel) {
      try {
        if (mounted) {
          setState(() {
            print(discussions);
            discussions.add(channel['name']);
          });
        }
      } catch (e) {
        print(e);
      }
    });

    getIt<SocketService>().on("change-notif", (channel) async {
      try {
        if (mounted) {
          setState(() async {
  
             for (int i = 0; i < discussions.length; i++) {
              if (channel == discussions[i]) {
                newMessage[i] = false;
              }
            }
          });
        }
      } catch (e) {
        print(e);
      }
    });

    

    getIt<SocketService>().on("notify-message", (message) {
      try {
        if (mounted) {
          setState(() {
              for (int i = 0; i < discussions.length; i++) {
              if (message['channel'] == discussions[i]) {
                newMessage[i] = true;
              }
            }
            
          });
          if(usernameMain != message['username']) {
                 showNotification(message['message'], message['channel']);
            }
        }
      } catch (e) {
        print(e);
      }
    });

    getIt<SocketService>().on("leave-channel", (dynamic) {});

    getIt<SocketService>().on("channels-joined", (dynamic) {
      try {
        if (mounted) {
          countJoin = countJoin + 1;
          print(countJoin);
          setState(() {
            print(selectedList.length);
           
            if(countJoin == selectedList.length) {
              for(int i=0; i<selectedList.length; i++) {
                  discussions.add(selectedList[i]);
                  newMessage.add(false);
                  
              }
              print(discussions);
              print(selectedList);
              countJoin = 0;
            }
          });
        }
      } catch (e) {
        print(e);
      }
    });

    getIt<SocketService>().on("get-config", (value) {
      // langOrTheme.language = value['language'];
      // langOrTheme.theme = value['theme'];

      nameController = TextEditingController(
          text: "");
      lang = value['langue'];
      if (mounted) {
        setState(() {
          lang = value['langue'];
        });
      }

    });
  }

  String numberUsersOfChannel(String nameChannelDeleted) {
    int count = 0;
    for (dynamic channel in allUsersChannels) {
      if (channel != null) {
        for (String nameChannel in channel) {
          if (nameChannel == nameChannelDeleted) {
            count += 1;
          }
        }
      }
    }
    if (count == 1) {
      return "delete";
    } else if (count > 1) {
      return "leave";
    } else {
      return "";
    }
  }

  void updateMessageState(int index) {
    setState(() {
      newMessage[index] = false;
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
            return Stack(
              children: [
                Channel(
                  name: discussions[index],
                  updateMessageState: () => updateMessageState(index),
                ),
                if (newMessage[index])
                  Positioned(
                    right: 8,
                    top: 17,
                    child: Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
              ],
            );
          },
          separatorBuilder: (context, index) => SizedBox(
            height: 10,
          ),
        ),
        ListTile(
          title: Row(
            children: <Widget>[
              Expanded(
                child: GameButton(
                  padding: 32.0,
                  route: () {
                    showModalAdd(context);
                  },
                  name: translate.translateString(lang, "Créer"),
                ),
              ),
              Expanded(
                child: GameButton(
                  padding: 32.0,
                  route: () {
                    showModalDelete(context);
                  },
                  name: translate.translateString(lang, "Supprimer"),
                ),
              ),
               Expanded(
                child: GameButton(
                  padding: 32.0,
                  route: () {
                    showModalLeave(context);
                  },
                  name: translate.translateString(lang, "Quitter"),
                ),
              ),
              Expanded(
                child: GameButton(
                  padding: 32.0,
                  route: () async {
                    await showModalSearch(context);
                  },
                  name: translate.translateString(lang, "Rechercher"),
                ),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}


  void showModalAdd(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) => AlertDialog(
        title: Text(translate.translateString(lang, 'Créer un nouveau chat')),
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
                    translate.translateString(lang, "Nom du chat"),
                  ),
                ),
                Container(
                    padding: const EdgeInsets.all(8.0),
                    child: TextFormField(
                      controller: nameController,
                    ))
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
              translate.translateString(lang, "Annuler"),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              getIt<SocketService>()
                  .send("channel-creation", nameController.text);
              print(nameController.text);
              Navigator.of(context).pop();
            },
            child: Text(
              translate.translateString(lang, "Créer le chat"),
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
        title: Text(translate.translateString(lang, 'Supprimer un chat')),
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
                    translate.translateString(
                        lang, "Choisissez un chat à supprimer"),
                  ),
                ),
                DropdownButtonFormField(
                  validator: (value) => value == null
                      ? translate.translateString(
                          lang, "Veuillez choisir le chat à supprimer")
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
                  }).toList(),
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
              translate.translateString(lang, "Annuler"),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              if (chatDeleted != 'General' && !chatDeleted.startsWith(translate.translateString(lang, "Partie de"))) {
                getIt<SocketService>().send("delete-channel", chatDeleted);
                setState(() {

                discussions.remove(chatDeleted);
              });

              }
             
              Navigator.of(context).pop();
            },
            child: Text(
              translate.translateString(lang, "Supprimer le chat"),
            ),
          )
        ],
      ),
    );
  }



  void showModalLeave(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) => AlertDialog(
        title: Text(translate.translateString(lang, 'Quitter un chat')),
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
                    translate.translateString(lang, "Choisissez un chat à quitter"),
                  ),
                ),
                DropdownButtonFormField(
                  validator: (value) => value == null
                      ? translate.translateString(lang, "Veuillez choisir le chat à quitter")
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
                  }).toList(),
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
              translate.translateString(lang, "Annuler"),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              if (chatDeleted != 'General' && !chatDeleted.startsWith(translate.translateString(lang, "Partie de"))) {
                getIt<SocketService>().send("leave-channel", chatDeleted);
                setState(() {

                discussions.remove(chatDeleted);
              });

              }

              
      
              Navigator.of(context).pop();
            },
            child: Text(
              translate.translateString(lang, "Quitter un chat"),
            ),
          )
        ],
      ),
    );
  }

  Future<List<String>> channelsToJoin() async {
    allChannelsDB = await ApiService().getAllChannels();

    print(allChannelsDB);
    
    List<String> filteredChannels = [];
    for (String channel in allChannelsDB) {
      if (!discussions.contains(channel)) {
        filteredChannels.add(channel);
      }
    }
    return filteredChannels;
  }

  Future<void> showModalSearch(BuildContext context) async {
    final fullList = await channelsToJoin();
    List<String> filteredList = fullList;
    selectedList = [];

    List<bool> checkedList = List.generate(
        fullList.length,
        (_) =>
            false); // Utilisez List.generate au lieu de List.filled pour initialiser une liste de booléens

    final searchController = TextEditingController();

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          child: Container(
            height: MediaQuery.of(context).size.height * 0.9,
            padding: EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: searchController,
                  decoration: InputDecoration(
                    hintText: translate.translateString(lang, 'Rechercher'),
                  ),
                  onChanged: (value) {
                    setState(() {
                      filteredList = fullList
                          .where((element) => element.contains(value))
                          .toList();
                    });
                  },
                ),
                SizedBox(height: 16),
                Expanded(
                  child: SingleChildScrollView(
                    child: ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: filteredList.length,
                      itemBuilder: (BuildContext context, int index) {
                        final item = filteredList[index];
                        return StatefulBuilder(
                          builder:
                              (BuildContext context, StateSetter setState) {
                            return CheckboxListTile(
                              title: Text(item),
                              value: checkedList[index],
                              onChanged: (value) {
                                setState(() {
                                  checkedList[index] = value!;
                                  if (value) {
                                    selectedList.add(item);
                                  } else {
                                    selectedList.remove(item);
                                  }
                                });
                              },
                            );
                          },
                        );
                      },
                    ),
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).pop();
                      },
                      child: Text(translate.translateString(lang, "Annuler")),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        print(selectedList);
                        for (String channel in selectedList) {
                          getIt<SocketService>().send("join-channel", channel);
                        }

                        Navigator.of(context).pop();
                      },
                      child: Text(translate.translateString(
                          lang, "Rejoindre le(s) chat(s)")),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
