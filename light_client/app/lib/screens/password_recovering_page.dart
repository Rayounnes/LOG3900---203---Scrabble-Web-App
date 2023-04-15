import 'package:app/screens/login_page.dart';
import 'package:app/services/translate_service.dart';
import 'package:flutter/material.dart';
import "package:app/services/api_service.dart";

import '../main.dart';
import '../services/socket_client.dart';

class RecoverAccountPage extends StatefulWidget {
  @override
  _RecoverAccountPageState createState() => _RecoverAccountPageState();
}

class _RecoverAccountPageState extends State<RecoverAccountPage> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  final usernameController = TextEditingController();
  final passwordController = TextEditingController();
  final passwordCheckController = TextEditingController();
  final securityResponseController = TextEditingController();
  String lang = "en";
  TranslateService translate = TranslateService();

  String securityQuestion = "Bonjour?";
  int securityID = -1;
  String securityAnswer = "pizza";
  String userName = "";
  bool isUserValid = false;

  @override
  void dispose() {
    usernameController.dispose();
    passwordController.dispose();
    passwordCheckController.dispose();
    securityResponseController.dispose();
    super.dispose();
  }

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

  void validateUser() async {
    try {
      securityID = await ApiService().getSecurityQstID(usernameController.text);
      securityAnswer =
          await ApiService().getSecurityAnswer(usernameController.text);

      if (securityID >= 0 && securityAnswer.isNotEmpty) {
        List variable = await ApiService().getSecurityQst();
        securityQuestion = variable[securityID];

        setState(() {
          userName = usernameController.text;
          isUserValid = true;
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            backgroundColor: Colors.blue,
            duration: Duration(seconds: 3),
            content: Text(translate.translateString(
                lang, "Ce nom d'utilisateur n'existe pas ou n'as pas été créé sur la plateforme mobile"))),
      );
    }
  }

  void recoverAccount() async {
    if (securityResponseController.text == securityAnswer) {
      try {
        if (await ApiService()
            .changePassword(usernameController.text, passwordController.text))
          Navigator.pop(context, '/loginScreen');
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              backgroundColor: Colors.blue,
              duration: Duration(seconds: 3),
              content: Text(translate.translateString(
                  lang, "Modification du mot de passe non-autorisée"))),
        );
      }
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
          translate.translateString(lang, "Retour"),
          style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
        ),
      ),
      body: Center(
        child: Container(
          height: isUserValid ? 600 : 300,
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
            child: Scrollbar(
              child: ListView(
                children: <Widget>[
                  Container(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Padding(
                            padding: const EdgeInsets.only(top: 20.0),
                            child: Text(
                                translate.translateString(
                                    lang, 'Récupération de compte'),
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 23,
                                  color: Colors.black,
                                  fontWeight: FontWeight.w700,
                                ))),
                        Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: TextFormField(
                            controller: usernameController,
                            enabled: isUserValid ? false : true,
                            decoration: InputDecoration(
                              hintText: translate.translateString(
                                  lang, "Entrez votre nom d'utilisateur"),
                              border: OutlineInputBorder(),
                              icon: Icon(Icons.account_box),
                            ),
                            validator: (String? value) {
                              if (value == null || value.isEmpty) {
                                return translate.translateString(
                                    lang, "Nom d'utilisateur requis.");
                              } else if (value.length < 5) {
                                return translate.translateString(lang,
                                    "Un nom d'utilisateur doit au moins contenir 5 caractéres.");
                              } else if (!value
                                  .contains(RegExp(r'^[a-zA-Z0-9]+$'))) {
                                return translate.translateString(lang,
                                    "Un nom d'utilisateur ne doit contenir que des lettres ou des chiffres");
                              }
                              return null;
                            },
                          ),
                        ),
                        if (isUserValid) displayRecoveryInfo(),
                        if (!isUserValid)
                          Padding(
                            padding: const EdgeInsets.all(20.0),
                            child: ElevatedButton(
                              onPressed: () {
                                setState(() {
                                  if (_formKey.currentState!.validate()) {
                                    validateUser();
                                  }
                                });
                              },
                              child: Text(translate.translateString(
                                  lang, "Vérifier l'identifiant")),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Column displayRecoveryInfo() {
    Column infos = Column();
    //setState(() {
    infos = Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: TextFormField(
            controller: passwordController,
            decoration: InputDecoration(
              hintText: translate.translateString(lang, "Nouveau mot de passe"),
              icon: Icon(Icons.password),
              border: OutlineInputBorder(),
            ),
            obscureText: true,
            validator: (String? value) {
              if (value == null || value.isEmpty) {
                return translate.translateString(lang, "Mot de passe requis.");
              } else if (value.length < 8) {
                return translate.translateString(lang,
                    "Un mot de passe doit contenir au minimum 8 caractéres.");
              }else if (!value
                  .contains(RegExp(r'^(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[!@#\$&*~]).{8,}$'))) {
                return translate.translateString(lang,
                    "Le mot de passe doit contenir au minimum un caractère spécial,\n un chiffre et une lettre en majuscule");
              }
              return null;
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: TextFormField(
            controller: passwordCheckController,
            decoration: InputDecoration(
              hintText:
                  translate.translateString(lang, "Retapez votre mot de passe"),
              icon: Icon(Icons.password),
              border: OutlineInputBorder(),
            ),
            obscureText: true,
            validator: (String? value) {
              if (value == null ||
                  value.isEmpty ||
                  value != passwordController.text) {
                return translate.translateString(
                    lang, "Le mot de passe écrit ne correspond pas");
              }
              return null;
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: TextFormField(
            controller: securityResponseController,
            decoration: InputDecoration(
              icon: Icon(Icons.question_answer_outlined),
              label: Text(securityQuestion),
              hintText: securityQuestion,
              border: OutlineInputBorder(),
            ),
            validator: (String? value) {
              if (value == '') {
                return translate.translateString(
                    lang, "Entrez une réponse à la question de sécurité");
              } else if (value != securityAnswer) {
                return translate.translateString(
                    lang, "Réponse incorrecte, veuillez réessayer");
              }
              return null;
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(20.0),
          child: ElevatedButton(
            onPressed: () {
              if (_formKey.currentState!.validate()) recoverAccount();
            },
            child: Text(
                translate.translateString(lang, 'Valider les modifications')),
          ),
        ),
      ],
    );
    //});

    return infos;
  }
}
