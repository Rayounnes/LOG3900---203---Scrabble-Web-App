import 'package:app/screens/login_page.dart';
import 'package:flutter/material.dart';
import "package:app/services/api_service.dart";


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
  }

  void validateUser() async {
    try{
      securityID = await ApiService().getSecurityQstID(usernameController.text);
      securityAnswer = await ApiService().getSecurityAnswer(usernameController.text);

      if (securityID >= 0 && securityAnswer.isNotEmpty) {
        List variable = await ApiService().getSecurityQst();
        securityQuestion = variable[securityID];

        setState(() {
          userName = usernameController.text;
          isUserValid = true;
        });

      }
    }
    catch(e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            backgroundColor: Colors.blue,
            duration: Duration(seconds: 3),
            content: Text("Ce nom d'utilisateur n'existe pas")),
      );
    }
  }

  void recoverAccount() async {
    if (securityResponseController.text == securityAnswer) {
      try{
        if (await ApiService()
            .changePassword(usernameController.text, passwordController.text))
          Navigator.pop(context, '/loginScreen');
      }
      catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              backgroundColor: Colors.blue,
              duration: Duration(seconds: 3),
              content: Text("Modification du mot de passe non-autorisée")),
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
          "Retour",
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
                            child: Text('Récupération de compte',
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
                            decoration: const InputDecoration(
                              hintText: "Entrez votre nom d'utilisateur",
                              border: OutlineInputBorder(),
                              icon: Icon(Icons.account_box),
                            ),
                            validator: (String? value) {
                              if (value == null || value.isEmpty) {
                                return "Nom d'utilisateur requis.";
                              } else if (value.length < 5) {
                                return "Un nom d'utilisateur doit au moins contenir 5 caractéres.";
                              } else if (!value
                                  .contains(RegExp(r'^[a-zA-Z0-9]+$'))) {
                                return "Un nom d'utilisateur ne doit contenir que des lettres ou des chiffres";
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
                              child: Text("Vérifier l'identifiant"),
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
            decoration: const InputDecoration(
              hintText: "Nouveau mot de passe",
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
                return "Entrez une réponse à la question de sécurité";
              } else if (value != securityAnswer) {
                return "Réponse incorrecte, veuillez réessayer";
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
            child: Text('Valider les modifications'),
          ),
        ),
      ],
    );
    //});

    return infos;
  }
}
