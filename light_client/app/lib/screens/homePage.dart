import 'package:app/screens/discussionsPage.dart';
import 'package:flutter/material.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Discussions(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (int index) {
          switch (index) {
            case 0:
              // only scroll to top when current index is selected.
              // if (_selectedIndex == index) {
              //   _homeController.animateTo(
              //     0.0,
              //     duration: const Duration(milliseconds: 500),
              //     curve: Curves.easeOut,
              //   );
              // }
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
              Navigator.pop(context);
              Navigator.pushNamed(context, '/loginScreen');
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
