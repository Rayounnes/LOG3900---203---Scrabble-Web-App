import 'package:app/screens/channels_page.dart';
import 'package:app/services/socket_client.dart';
import 'package:flutter/material.dart';
import 'package:app/main.dart';
import 'package:app/services/user_infos.dart';
import 'package:app/services/api_service.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 0;

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
    return Scaffold(
      body: Channels(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (int index) {
          switch (index) {
            case 0:
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
        selectedItemColor: Colors.blue,
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
        ],
      ),
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
