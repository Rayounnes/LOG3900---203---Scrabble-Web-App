import 'package:app/screens/channels_page.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/services/translate_service.dart';
import 'package:flutter/material.dart';
import 'package:app/main.dart';
import 'package:app/services/user_infos.dart';
import 'package:app/services/api_service.dart';

import '../models/personnalisation.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String lang = "en";
  TranslateService translate = new TranslateService();

  @override
  void initState() {
    super.initState();
    getConfigs();
    handleSockets();
  }

  getConfigs() {
    getIt<SocketService>().send("get-config");
  }

  void handleSockets() {
    getIt<SocketService>().on("get-config", (value) {
      lang = value['langue'];
      if (mounted) {
        setState(() {
          lang = value['langue'];
        });
      }

    });
  }

  int _selectedIndex = -1;
  int _counter = 5;
  void logoutUser() async {
    String username = getIt<UserInfos>().user;
    await ApiService().logoutUser(username);
    getIt<SocketService>().disconnect();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
          backgroundColor: Colors.blue,
          duration: Duration(seconds: 3),
          content: Text(translate.translateString(
              lang, "Vous avez été déconnecté avec succés"))),
    );
    Navigator.pushNamed(context, '/loginScreen');
  }

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: _selectedIndex == -1 ? 0 : _selectedIndex,
      onTap: (int index) {
        switch (index) {
          case 0:
            Navigator.push(context, MaterialPageRoute(builder: (context) {
              return Channels();
            }));
            break;
          case 1:
            showModal(context);
            break;
        }
        setState(
          () {
            _selectedIndex = index;
          },
        );
      },
      selectedItemColor:
          _selectedIndex == -1 ? Colors.grey.shade600 : Colors.blue,
      unselectedItemColor: Colors.grey.shade600,
      selectedLabelStyle: TextStyle(fontWeight: FontWeight.w600),
      unselectedLabelStyle: TextStyle(fontWeight: FontWeight.w600),
      type: BottomNavigationBarType.fixed,
      items: [
        BottomNavigationBarItem(
          icon: Icon(Icons.message),
          label: translate.translateString(lang, "Conversations"),
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.logout),
          label: translate.translateString(lang, "Déconnexion"),
        ),
        BottomNavigationBarItem(
          icon: Stack(
            children: <Widget>[
              Icon(Icons.notifications),
              Positioned(
                right: 0,
                child: Container(
                  padding: EdgeInsets.all(1),
                  decoration: BoxDecoration(
                    color: Colors.red,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  constraints: BoxConstraints(
                    minWidth: 12,
                    minHeight: 12,
                  ),
                  child: Text(
                    '$_counter',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 8,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              )
            ],
          ),
          label: 'Notifications',
        )
      ],
    );
  }

  void showModal(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) => AlertDialog(
        title: Text(translate.translateString(lang, 'Déconnexion')),
        content: Text(translate.translateString(
            lang, 'Etes-vous sur de vous déconnecter ?')),
        actions: <TextButton>[
          TextButton(
            onPressed: () {
              logoutUser();
            },
            child: Text(translate.translateString(lang, 'Oui')),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(
                () {
                  _selectedIndex = 0;
                },
              );
            },
            child: Text(translate.translateString(lang, 'Non')),
          ),
        ],
      ),
    );
  }
}
