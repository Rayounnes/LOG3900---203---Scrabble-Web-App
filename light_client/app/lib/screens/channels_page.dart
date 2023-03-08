
import 'package:app/screens/chat_page.dart';
import 'package:flutter/material.dart';
import 'package:app/widgets/channel.dart';
import 'package:app/widgets/button.dart';
import 'package:app/main.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/services/api_service.dart';
import 'package:app/models/channels_model.dart';

class Channels extends StatefulWidget {
  const Channels({super.key});
  @override
  State<Channels> createState() => _ChannelsState();

}

class _ChannelsState extends State<Channels> {
  @override
  void initState() {
    super.initState();
    handleSockets();
   
    
  }

  List<String> discussions = ["General"];
  List<dynamic> allChannelsDB = [];
  List<dynamic> allUsersChannels = [];

  List<dynamic> channelsUsers = [];
  final nameController = TextEditingController(text: "Nouvelle discussion");
  
  String chatDeleted = '';
  String chatJoined = '';

  handleSockets() async{
     ApiService().getAllChannels().then((response) {
      allChannelsDB = response;
      }).catchError((error) {
      print('Error fetching channels: $error');
      });

      ApiService().getAllUsers().then((response) {
        allUsersChannels=response;
      }).catchError((error) {
      print('Error fetching channels: $error');
      });

      getIt<SocketService>().on("sendUsername", (username) async {
         ApiService().getChannelsOfUsers(username).then((response) {
          channelsUsers=response;
          print(channelsUsers);
           setState(() {
        
          discussions = ["General"];
          for(String channel in channelsUsers) {
            if(channel != "General") {
                discussions.add(channel); 
            }
            } 
          print(discussions); 
          });
          }).catchError((error) {
          print('Error fetching channels: $error');});

          
    
         

         

          });
 
    
      getIt<SocketService>().on("channel-created", (channel) {
      try {
        if (mounted) {
          setState(() {
            discussions.add(channel['name']);
          });
        }
      } catch (e) {
        print(e);
      }
    });

    getIt<SocketService>().on("leave-channel", (dynamic) {});

    getIt<SocketService>().on("channels-joined", (dynamic) {
      try {
        if (mounted) {
          setState(() {
            discussions.add(chatJoined);
          });
        }
      } catch (e) {
        print(e);
      }
    });
  }



  String numberUsersOfChannel(String nameChannelDeleted) {
    int count = 0;
    for(dynamic channel in allUsersChannels){
      if (channel != null) {
        for(String nameChannel in channel){
          if(nameChannel == nameChannelDeleted){
            count += 1;
          }
        }

      }
    }
    if(count == 1) {
      return "delete";
    }
    else if (count > 1) {
      return "leave";
    }
    else {
      return "";
    }
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
                    showModalAdd(context);
                      }, 
                    name: "Créer un chat",
                    )),
                    Expanded(child: GameButton(
                    padding: 32.0,
                    route: () {
                    showModalDelete(context);
                      }, 
                    name: "Supprimer un chat ",
                    )),
                    Expanded(child: GameButton(
                    padding: 32.0,
                    route: () {
                      showModalSearch(context);
                      }, 
                    name: "Rechercher un chat",
                    ))
            ],
          ),
        )                  
        ],
      ),
    );
  }


  void showModalAdd(BuildContext context) {
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
              getIt<SocketService>().send("channel-creation", nameController.text);
              Navigator.of(context).pop();
            },
            child: Text(
              "Créer le chat",
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
        title: Text('Supprimer un chat'),
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
                    "Choisissez un chat à supprimer",
                  ),
                ),
                DropdownButtonFormField(
                    validator: (value) => value == null
                        ? "Veuillez choisir le chat à supprimer"
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
                    }).toList(),)
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
              String action = numberUsersOfChannel(chatDeleted);
              if(action == "delete") {
                 getIt<SocketService>().send("delete-channel", chatDeleted);
              }
              else if(action == "leave"){
                getIt<SocketService>().send("leave-channel", chatDeleted); 
              }
              else {}
              setState(() {
              if(chatDeleted != 'General') {
                discussions.remove(chatDeleted);
              } 
              });
              Navigator.of(context).pop();
            },
            child: Text(
              "Supprimer le chat",
            ),
          )
        ],
      ),
    );
  }


   void showModalSearch(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) => AlertDialog(
        title: Text('Rechercher un chat'),
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
                    "Choisissez un chat que vous voulez rejoindre",
                  ),
                ),
                DropdownButtonFormField(
                    validator: (value) => value == null
                        ? "Veuillez choisir le chat à rejoindre"
                        : null,
                    value: allChannelsDB[0],
                    onChanged: (Object? newValue) {
                      setState(() {
                        chatJoined = newValue! as String;
                      });
                    },
                    items: allChannelsDB.map((discussion) {
                    return DropdownMenuItem(
                    value: discussion,
                    child: Text(discussion),
                    );
                    }).toList(),)
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
              getIt<SocketService>().send("join-channel", chatJoined);
              Navigator.of(context).pop();
            },
            child: Text(
              "Rejoindre le chat",
            ),
          )
        ],
      ),
    );
  }

  
}
