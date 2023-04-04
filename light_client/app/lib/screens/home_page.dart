import 'package:app/screens/channels_page.dart';
import 'package:app/services/socket_client.dart';
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
    late Personnalisation langOrTheme;


  @override
  void initState() {
    super.initState();
    handleSockets();

  }

  void handleSockets(){
    getIt<SocketService>().on("get-theme-language", (value) {
      langOrTheme = value;
    });
  }

  int _selectedIndex = -1;
  int _counter = 5;
  void logoutUser() async {
    String username = getIt<UserInfos>().user;
    await ApiService().logoutUser(username);
    getIt<SocketService>().disconnect();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
          backgroundColor: Colors.blue,
          duration: Duration(seconds: 3),
          content: Text("Vous avez été déconnecté avec succés")),
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
          label: "Conversations",
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.logout),
          label: "Déconnexion",
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
        title: const Text('Déconnexion'),
        content: const Text('Etes-vous sur de vous déconnecter ?'),
        actions: <TextButton>[
          TextButton(
            onPressed: () {
              logoutUser();
            },
            child: const Text('Oui'),
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
            child: const Text('Non'),
          ),
        ],
      ),
    );
  }
}
