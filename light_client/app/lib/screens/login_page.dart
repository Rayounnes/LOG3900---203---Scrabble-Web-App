//import 'dart:ffi';

import 'package:app/constants/http_codes.dart';
import 'package:app/models/login_infos.dart';
import 'package:app/services/socket_client.dart';
import 'package:flutter/material.dart';
import "package:app/services/api_service.dart";
import 'package:app/services/user_infos.dart';
import 'package:app/main.dart';

class LoginDemo extends StatefulWidget {
  @override
  _LoginDemoState createState() => _LoginDemoState();
}

class _LoginDemoState extends State<LoginDemo> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final usernameController = TextEditingController();
  final passwordController = TextEditingController();
  bool buttonEnabled = true;

  String selectedLanguage = 'fr';

  int _selectedButton = 1;

  void _onButtonSelected(int? value) {
    setState(() {
      _selectedButton = value!;
    });
  }

  @override
  void initState() {
    super.initState();
    if (!getIt<SocketService>().isSocketAlive())
      getIt<SocketService>().connect();
  }

  @override
  void dispose() {
    usernameController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  void setLanguage() {
    selectedLanguage = _selectedButton == 1 ? "fr" : "en";
    getIt<SocketService>().send("setLanguage", selectedLanguage);
  }

  void connect() async {
    if (!_formKey.currentState!.validate()) return;
    String username = usernameController.text;
    String password = passwordController.text;
    int response = await ApiService()
        .loginUser(LoginInfos(username: username, password: password));
    if (response == HTTP_STATUS_OK) {
      getIt<UserInfos>().setUser(username);
      getIt<SocketService>().send("user-connection", <String, String>{
        "username": username,
        "socketId": getIt<SocketService>().socketId
      });
      Navigator.pushNamed(context, '/gameChoicesScreen');
    } else if (response == HTTP_STATUS_UNAUTHORIZED) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            backgroundColor: Colors.blue,
            duration: Duration(seconds: 3),
            content: Text(
                "Erreur lors de la connexion. Mauvais nom d'utilisateur et/ou mot de passe ou compte deja connecté. Veuillez recommencer")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.green[800],
      body: Center(
        child: Container(
          height: 700,
          width: 600,
          decoration: BoxDecoration(
            color: Color.fromRGBO(203, 201, 201, 1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              width: 1,
              color: Colors.grey,
            ),
          ),
          child: Form(
            key: _formKey,
            child: Column(
              children: <Widget>[
                Container(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: <Widget>[
                      ElevatedButton(
                        onPressed: () {
                          _onButtonSelected(1);
                        },
                        style: ElevatedButton.styleFrom(
                          primary:
                              _selectedButton == 1 ? Colors.green : Colors.grey,
                        ),
                        child: Text('Français'),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          _onButtonSelected(2);
                        },
                        style: ElevatedButton.styleFrom(
                          primary:
                              _selectedButton == 2 ? Colors.green : Colors.grey,
                        ),
                        child: Text('English'),
                      ),
                    ],
                  ),
                ),
                // Align(
                //   alignment: Alignment.topLeft,
                //   child: Container(
                //     child: Column(
                //       mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                //       children: <Widget>[
                //         ElevatedButton(
                //           onPressed: () {
                //             print("fr");
                //           },
                //           child: Text('Français'),
                //         ),
                //         ElevatedButton(
                //           onPressed: () {
                //             print("en");
                //           },
                //           child: Text('Anglais'),
                //         ),
                //       ],
                //     ),
                //   ),
                // ),
                Padding(
                    padding: const EdgeInsets.only(top: 60.0),
                    child: Container(
                      width: 200,
                      height: 150,
                      child: Text('Connexion à votre compte',
                          style: TextStyle(
                            fontSize: 23,
                            color: Colors.black,
                            fontWeight: FontWeight.w700,
                          )),
                    )),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: TextFormField(
                    controller: usernameController,
                    decoration: const InputDecoration(
                      hintText: "Nom d'utilisateur",
                      border: OutlineInputBorder(),
                      icon: Icon(Icons.account_box),
                    ),
                    validator: (String? value) {
                      if (value == null || value.isEmpty) {
                        return "Nom d'utilisateur requis.";
                      } else if (value.length < 5) {
                        return "Un nom d'utilisateur doit au moins contenir 5 caractéres.";
                      } else if (!value.contains(RegExp(r'^[a-zA-Z0-9]+$'))) {
                        return "Un nom d'utilisateur ne doit contenir que des lettres ou des chiffres";
                      }
                      return null;
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: TextFormField(
                    controller: passwordController,
                    decoration: const InputDecoration(
                      hintText: "Mot de passe",
                      icon: Icon(Icons.password),
                      border: OutlineInputBorder(),
                    ),
                    obscureText: true,
                    validator: (String? value) {
                      if (value == null || value.isEmpty) {
                        return "Mot de passe requis.";
                      } else if (value.length < 6) {
                        return "Un mot de passe doit contenir au minimum 6 caractéres.";
                      }
                      return null;
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: ElevatedButton(
                    onPressed: () {
                      connect();
                      setLanguage();
                    },
                    child: Text('Connexion'),
                  ),
                ),
                TextButton(
                  child: Text('Nouveau? Créer votre compte'),
                  onPressed: () {
                    Navigator.pushNamed(context, '/signScreen');
                  },
                ),
                TextButton(
                  child: Text('Mot de passe oublié?'),
                  onPressed: () {
                    Navigator.pushNamed(context, '/recoverPassScreen');
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
