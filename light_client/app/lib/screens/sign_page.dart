import 'package:app/constants/widgets.dart';
import 'package:app/screens/login_page.dart';
import 'package:flutter/material.dart';
import "package:app/services/api_service.dart";
import "package:app/models/login_infos.dart";
import "package:app/constants/http_codes.dart";
import 'package:app/main.dart';
import 'package:app/services/user_infos.dart';
import 'package:app/services/socket_client.dart';

class SignUp extends StatefulWidget {
  @override
  _SignUpState createState() => _SignUpState();
}

class _SignUpState extends State<SignUp> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  final usernameController = TextEditingController();
  final passwordController = TextEditingController();
  final passwordCheckController = TextEditingController();

  @override
  void dispose() {
    usernameController.dispose();
    passwordController.dispose();
    passwordCheckController.dispose();
    super.dispose();
  }

  void createAccount() async {
    if (!_formKey.currentState!.validate()) return;
    String username = usernameController.text;
    String password = passwordController.text;
    int response = await ApiService()
        .createUser(LoginInfos(username: username, password: password));
    if (response == HTTP_STATUS_OK) {
      getIt<UserInfos>().setUser(username);
      getIt<SocketService>().send("user-connection", <String, String>{
        "username": username,
        "socketId": getIt<SocketService>().socketId
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            backgroundColor: Colors.blue,
            duration: Duration(seconds: 3),
            content: Text("Votre compte a été créé avec succés")),
      );

      Navigator.pushNamed(context, '/gameChoicesScreen');
    } else if (response == HTTP_STATUS_UNAUTHORIZED) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            backgroundColor: Colors.blue,
            duration: Duration(seconds: 3),
            content: Text(
                "Erreur lors de la création du compte. Nom d'utilisateur deja utilisé. Veuillez recommencer.")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.green[800],
      appBar: AppBar(
        backgroundColor: Colors.white,
        leading: IconButton(
            icon: Icon(Icons.arrow_back),
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return LoginDemo();
              }));
            }),
        title: Text(
          "Retour",
          style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
        ),
      ),
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
                Padding(
                    padding: const EdgeInsets.only(top: 30.0, bottom: 30.0),
                    child: SizedBox(
                      width: 400,
                      child: Text('Création de compte',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 23,
                            color: Colors.black,
                            fontWeight: FontWeight.w700,
                          )),
                    )),
                Padding(
                  padding: const EdgeInsets.only(bottom: 30.0),
                  child: Container(
                    width: 200,
                    height: 150,
                    decoration: BoxDecoration(
                      color: Color.fromARGB(255, 203, 213, 203),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: Color.fromARGB(255, 2, 126, 42),
                        width: 2,
                      ),
                    ),
                    child:
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            IconButton(
                              icon: Icon(Icons.collections,
                                  size: TILE_SIZE,
                                  color: Color.fromARGB(255, 12, 12, 12)),
                              onPressed: () {},
                            ),
                            IconButton(
                              icon: Icon(Icons.compare_arrows,
                                  size: TILE_SIZE/2,
                                  color: Color.fromARGB(255, 12, 12, 12)),
                              onPressed: null,
                            ),
                            IconButton(
                              icon: Icon(Icons.add_a_photo,
                                  size: TILE_SIZE,
                                  color: Color.fromARGB(255, 12, 12, 12)),
                              onPressed: () {
                                Navigator.pushNamed(context, '/userScreen'); // Pour prendre une photo
                              },
                            ),
                        ],)
                  ),
                ),
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
                  child: TextFormField(
                    controller: passwordCheckController,
                    decoration: const InputDecoration(
                      hintText: "Retapez votre mot de passe",
                      icon: Icon(Icons.password),
                      border: OutlineInputBorder(),
                    ),
                    obscureText: true,
                    validator: (String? value) {
                      if (value == null ||
                          value.isEmpty ||
                          value != passwordController.text) {
                        return "Le mot de passe écrit ne correspond pas";
                      }
                      return null;
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(30.0),
                  child: ElevatedButton(
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        createAccount();
                      }
                    },
                    child: Text('Créer le compte'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
