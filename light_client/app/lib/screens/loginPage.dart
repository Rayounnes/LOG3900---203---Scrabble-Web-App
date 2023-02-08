import 'dart:ffi';

import 'package:app/constants/http_codes.dart';
import 'package:app/models/login_infos.dart';
import 'package:app/services/socket_client.dart';
import 'package:flutter/material.dart';
import "package:app/services/api_service.dart";
import 'package:app/models/user_infos.dart';
import 'package:app/main.dart';

class LoginDemo extends StatefulWidget {
  @override
  _LoginDemoState createState() => _LoginDemoState();
}

class _LoginDemoState extends State<LoginDemo> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  // Create a text controller and use it to retrieve the current value
  // of the TextField.
  final usernameController = TextEditingController();
  final passwordController = TextEditingController();
  bool buttonEnabled = true;
  @override
  void dispose() {
    // Clean up the controller when the widget is disposed.
    usernameController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  void connect() async {
    if (!_formKey.currentState!.validate()) return;
    String username = usernameController.text;
    String password = passwordController.text;
    int response = await ApiService()
        .loginUser(LoginInfos(username: username, password: password));
    if (response == HTTP_STATUS_OK) {
      print("setting username $username");
      getIt<UserInfos>().setUser(username);
      getIt<SocketService>().connect();
      Navigator.pushNamed(context, '/homeScreen');
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
      body: Center(
        child: Container(
          height: 700,
          width: 600,
          decoration: BoxDecoration(
            color: Colors.blue[200],
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
              ],
            ),
          ),
        ),
      ),
    );
  }
}
