import 'dart:io';
import 'dart:convert';

import 'package:app/constants/widgets.dart';
import 'package:app/screens/gallery_page.dart';
import 'package:app/screens/login_page.dart';
import 'package:app/services/translate_service.dart';
import 'package:flutter/material.dart';
import "package:app/services/api_service.dart";
import "package:app/models/login_infos.dart";
import "package:app/constants/http_codes.dart";
import 'package:app/main.dart';
import 'package:app/services/user_infos.dart';
import 'package:app/services/socket_client.dart';

import '../models/personnalisation.dart';

class SignUp extends StatefulWidget {
  @override
  _SignUpState createState() => _SignUpState();
}

class _SignUpState extends State<SignUp> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  final usernameController = TextEditingController();
  final passwordController = TextEditingController();
  final emailController = TextEditingController();
  final passwordCheckController = TextEditingController();
  final securityResponseController = TextEditingController();
  final securityQuestionController = TextEditingController();
  late Personnalisation langOrTheme;
  String lang = "en";
  TranslateService translate = new TranslateService();

  String selectedQuestion = "";
  String picturePath = "";
  List iconList = [];
  List decodedBytesList = [];
  bool isIcon = false;
  int number = -1;

  List<String> questions = [];

  @override
  void dispose() {
    usernameController.dispose();
    passwordController.dispose();
    passwordCheckController.dispose();
    emailController.dispose();
    securityResponseController.dispose();
    securityQuestionController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    getIconList();
    handleSockets();
    if(lang == "en") {
      questions = List.from(SECURITY_QUESTIONS_EN);
    } else{
      questions = List.from(SECURITY_QUESTIONS_FR);
    }
  }

  void handleSockets() {
    getIt<SocketService>().on("get-configs", (value) {
      langOrTheme = value;
    });
  }

  void setProfilePic(String imagePath) {
    setState(() {
      picturePath = imagePath;
    });
  }

  Future<void> getIconList() async {
    iconList = await ApiService().getAllIcons('Bottt');
    for (int i = 0; i < iconList.length; i++) {
      decodedBytesList.add(
          base64Decode(iconList[i].toString().substring(BASE64PREFIX.length)));
    }
  }

  void createAccount() async {
    if (!_formKey.currentState!.validate()) return;
    String username = usernameController.text;
    File imageFile = File(picturePath);
    List<int> imageBytes = [];
    if (!isIcon) imageBytes = await imageFile.readAsBytes();
    String imageBase64 = isIcon
        ? BASE64PREFIX + base64Encode(decodedBytesList[number])
        : BASE64PREFIX + base64Encode(imageBytes);

    bool iconResponse = await ApiService().pushIcon(imageBase64, username);
    if (iconResponse) {
      int response = await ApiService().createUser(LoginInfos(
          username: username,
          password: passwordController.text,
          email: emailController.text,
          icon: imageBase64,
          socket: getIt<SocketService>().socketId,
          qstIndex: selectedQuestion,
          qstAnswer: securityResponseController.text));
      if (response == HTTP_STATUS_OK) {
        getIt<UserInfos>().setUser(username);
        getIt<SocketService>().send("user-connection", <String, String>{
          "username": username,
          "socketId": getIt<SocketService>().socketId
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              backgroundColor: Colors.blue,
              duration: Duration(seconds: 3),
              content: Text(translate.translateString(lang,"Votre compte a été créé avec succés"))),
        );

        Navigator.pushNamed(context, '/gameChoicesScreen');
      } else if (response == HTTP_STATUS_UNAUTHORIZED) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              backgroundColor: Colors.blue,
              duration: Duration(seconds: 3),
              content: Text(
                  translate.translateString(lang,"Erreur lors de la création du compte. Nom d'utilisateur deja utilisé. Veuillez recommencer."))),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final List<DropdownMenuEntry<String>> qsts = <DropdownMenuEntry<String>>[];
    for (int i = 0; i < questions.length; i++) {
      qsts.add(DropdownMenuEntry<String>(value: '$i', label: questions[i]));
    }

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
          translate.translateString(lang,"Retour"),
          style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
        ),
      ),
      body: Center(
        child: Container(
          height: 1000,
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
                            child: Text(translate.translateString(lang,'Création de compte'),
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 23,
                                  color: Colors.black,
                                  fontWeight: FontWeight.w700,
                                ))),
                        displayProfilePicture(),
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: TextFormField(
                            controller: usernameController,
                            decoration:  InputDecoration(
                              hintText: translate.translateString(lang,"Nom d'utilisateur"),
                              border: OutlineInputBorder(),
                              icon: Icon(Icons.account_box),
                            ),
                            validator: (String? value) {
                              if (value == null || value.isEmpty) {
                                return translate.translateString(lang,"Nom d'utilisateur requis.");
                              } else if (value.length < 5) {
                                return translate.translateString(lang,"Un nom d'utilisateur doit au moins contenir 5 caractéres.");
                              } else if (!value
                                  .contains(RegExp(r'^[a-zA-Z0-9]+$'))) {
                                return translate.translateString(lang,"Un nom d'utilisateur ne doit contenir que des lettres ou des chiffres");
                              }
                              return null;
                            },
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: TextFormField(
                            controller: emailController,
                            decoration:  InputDecoration(
                              hintText: translate.translateString(lang,'Addresse email'),
                              icon: Icon(Icons.email),
                              border: OutlineInputBorder(),
                            ),
                            keyboardType: TextInputType.emailAddress,
                            validator: (String? value) {
                              if (value!.isEmpty ||
                                  !RegExp(r'\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b')
                                      .hasMatch(value)) {
                                return translate.translateString(lang,'Entrez une adresse email valide.');
                              }
                              return null;
                            },
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: TextFormField(
                            controller: passwordController,
                            decoration: InputDecoration(
                              hintText: translate.translateString(lang,"Mot de passe"),
                              icon: Icon(Icons.password),
                              border: OutlineInputBorder(),
                            ),
                            obscureText: true,
                            validator: (String? value) {
                              if (value == null || value.isEmpty) {
                                return translate.translateString(lang,"Mot de passe requis.");
                              } else if (value.length < 6) {
                                return translate.translateString(lang,"Un mot de passe doit contenir au minimum 6 caractéres.");
                              }
                              return null;
                            },
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: TextFormField(
                            controller: passwordCheckController,
                            decoration:  InputDecoration(
                              hintText: translate.translateString(lang,"Retapez votre mot de passe"),
                              icon: Icon(Icons.password),
                              border: OutlineInputBorder(),
                            ),
                            obscureText: true,
                            validator: (String? value) {
                              if (value == null ||
                                  value.isEmpty ||
                                  value != passwordController.text) {
                                return translate.translateString(lang,"Le mot de passe écrit ne correspond pas");
                              }
                              return null;
                            },
                          ),
                        ),
                        Padding(
                          padding:
                              const EdgeInsets.only(top: 20.0, bottom: 20.0),
                          child: Center(
                            child: DropdownMenu(
                              width: 450,
                              leadingIcon: Icon(Icons.security_outlined),
                              // initialSelection: questions[0],
                              controller: securityQuestionController,
                              label:  Text(translate.translateString(lang,'Question de sécurité')),
                              dropdownMenuEntries: qsts,
                              onSelected: (String? question) {
                                setState(() {
                                  selectedQuestion = question!;
                                });
                              },
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: TextFormField(
                            controller: securityResponseController,
                            decoration: InputDecoration(
                              icon: Icon(Icons.question_answer_outlined),
                              label: Text(selectedQuestion == ''
                                  ? translate.translateString(lang,'Choisissez une question de sécurité')
                                  : securityQuestionController.text),
                              hintText: translate.translateString(lang,'Réponse à la question'),
                              border: OutlineInputBorder(),
                            ),
                            validator: (String? value) {
                              if (value == null || value.isEmpty) {
                                return translate.translateString(lang,"Entrez une réponse à la question de sécurité");
                              }
                              return null;
                            },
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: ElevatedButton(
                            onPressed: (picturePath.isEmpty && !isIcon) ||
                                    selectedQuestion == ''
                                ? null
                                : () {
                                    if (_formKey.currentState!.validate()) {
                                      createAccount();
                                    }
                                  },
                            child: Text(translate.translateString(lang,'Créer le compte')),
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

  Padding displayProfilePicture() {
    Padding pictureArea = Padding(
      padding: const EdgeInsets.only(bottom: 1.0),
    );
    setState(() {
      pictureArea = Padding(
          padding: const EdgeInsets.all(20.0),
          child: Container(
            width: picturePath.isEmpty ? 200 : 200,
            height: picturePath.isEmpty ? 200 : 230,
            decoration: BoxDecoration(
              color: Color.fromARGB(255, 253, 253, 253),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: picturePath.isEmpty
                    ? Colors.red
                    : Color.fromARGB(255, 0, 0, 0),
                width: 2,
              ),
            ),
            child: picturePath.isEmpty && !isIcon
                ? Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Hero(
                        tag: 'galleryButton',
                        child: IconButton(
                          icon: Icon(Icons.collections,
                              size: TILE_SIZE,
                              color: Color.fromARGB(255, 0, 0, 0)),
                          onPressed: () async {
                            File? imageFile = await Navigator.push(context,
                                MaterialPageRoute(builder: (context) {
                              return GalleryPage(
                                iconList: decodedBytesList,
                              );
                            })) as File?;
                            if (imageFile != null) {
                              try {
                                number = int.parse(imageFile.path);
                                if (number >= 0) {
                                  setState(() {
                                    isIcon = true;
                                  });
                                }
                                print(BASE64PREFIX +
                                    base64Encode(decodedBytesList[number]) +
                                    'DECODEEE \n');
                              } catch (e) {
                                print(
                                    "Erreur de parsage en int pour le FileImage");
                                setProfilePic(imageFile.path);
                              }
                            }
                          },
                        ),
                      ),
                      IconButton(
                          icon: Icon(Icons.compare_arrows,
                              size: TILE_SIZE / 2,
                              color: Color.fromARGB(255, 12, 12, 12)),
                          onPressed: () {}),
                      Hero(
                        tag: 'pictureButton',
                        child: IconButton(
                          icon: Icon(Icons.add_a_photo,
                              size: TILE_SIZE,
                              color: Color.fromARGB(255, 0, 0, 0)),
                          onPressed: () async {
                            File? imageFile = await Navigator.pushNamed(
                                context, '/cameraScreen') as File?;
                            if (imageFile != null) {
                              setProfilePic(imageFile.path);
                            }
                          },
                        ),
                      ),
                    ],
                  )
                : Stack(
                    children: <Widget>[
                      isIcon
                          ? Center(
                              child: Image.memory(decodedBytesList[number],
                                  height: 180, width: 180),
                            )
                          : Center(
                              child: Image.file(
                                File(picturePath),
                              ),
                            ),
                      Align(
                        alignment: Alignment.topRight,
                        child: ElevatedButton(
                            onPressed: () {
                              setState(() {
                                picturePath = "";
                                isIcon = false;
                                number = -1;
                              });
                            },
                            child: Icon(
                              Icons.close,
                              color: Colors.red,
                            )),
                      ),
                    ],
                  ),
          ));
    });
    return pictureArea;
  }
}
