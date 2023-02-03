import 'package:flutter/material.dart';
import "package:app/services/api_service.dart";
import "package:app/models/login_infos.dart";
import "package:app/constants/http_codes.dart";

class SignUp extends StatefulWidget {
  @override
  _SignUpState createState() => _SignUpState();
}

class _SignUpState extends State<SignUp> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  // Create a text controller and use it to retrieve the current value
  // of the TextField.
  final usernameController = TextEditingController();
  final passwordController = TextEditingController();
  final passwordCheckController = TextEditingController();
  @override
  void dispose() {
    // Clean up the controller when the widget is disposed.
    usernameController.dispose();
    passwordController.dispose();
    passwordCheckController.dispose();
    super.dispose();
  }

  void createAccount() async {
    if (_formKey.currentState!.validate()) {
      String username = usernameController.text;
      String password = passwordController.text;
      int response = await ApiService()
          .createUser(LoginInfos(username: username, password: password));
      if (response == HTTP_STATUS_OK) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              backgroundColor: Colors.blue,
              duration: Duration(seconds: 3),
              content: Text("Votre compte a été créé avec succés")),
        );
        Navigator.pushNamed(context, '/homeScreen');
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
                      child: Text('Création de compte',
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
                        return "Veillez entrer un nom d'utilisateur";
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
                        return "Veillez entrer un mot de passe";
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
                        return "Le mot de passe écrit ne correspond pas à celui écrit";
                      }
                      return null;
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: ElevatedButton(
                    onPressed: () {
                      // Validate returns true if the form is valid, or false otherwise.
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
