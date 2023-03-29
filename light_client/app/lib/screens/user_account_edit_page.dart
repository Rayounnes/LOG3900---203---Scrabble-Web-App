import 'dart:convert';
import 'dart:io';
import 'dart:core';

import 'package:app/screens/gallery_page.dart';
import 'package:flutter/material.dart';

import '../constants/widgets.dart';
import '../main.dart';
import '../services/api_service.dart';
import '../services/socket_client.dart';
import 'game_modes_page.dart';

class UserAccountEditPage extends StatefulWidget {
  final String username;

  const UserAccountEditPage({super.key, required this.username});

  @override
  _UserAccountEditPageState createState() => _UserAccountEditPageState();
}

class _UserAccountEditPageState extends State<UserAccountEditPage> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final newUsernameController = TextEditingController();
  final usernameValidationController = TextEditingController();
  String picturePath = "";
  List iconList = [];
  List decodedBytesList = [];
  bool isIcon = false;
  int number =-1;

  @override
  void initState() {
    super.initState();
    getIconList();
  }

  @override
  void dispose() {
    newUsernameController.dispose();
    usernameValidationController.dispose();
    super.dispose();
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
    print("$decodedBytesList BYTESSS \n");
  }

  void modifyAccountInfo() async {
    if (newUsernameController.text != '' || picturePath != '' || isIcon) {
      String name = usernameValidationController.text;
      if (picturePath != '' || isIcon) {
        File imageFile = File(picturePath);
        List<int> imageBytes = [];
        if(!isIcon) imageBytes = await imageFile.readAsBytes();
        String imageBase64 = isIcon ? BASE64PREFIX + base64Encode(decodedBytesList[number]) :BASE64PREFIX + base64Encode(imageBytes);
        await ApiService().pushIcon(imageBase64, newUsernameController.text);
        await ApiService().changeIcon(usernameValidationController.text, imageBase64);
      }
      if (newUsernameController.text != '') {
        bool res = await ApiService().changeUsername(newUsernameController.text, usernameValidationController.text,);
        if(res){
          name = newUsernameController.text;
          getIt<SocketService>().send('change-username',name);
        }
        else{
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                backgroundColor: Color.fromARGB(255, 83, 162, 84),
                duration: Duration(seconds: 3),
                content: Text("Ce username est deja utilisé !")),
          );
          return;
        }
      }

      Navigator.push(context, MaterialPageRoute(
            builder: (context) => GameModes(name: name)));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            backgroundColor: Color.fromARGB(255, 83, 162, 84),
            duration: Duration(seconds: 3),
            content: Text("Veuillez entrer un nouvel utilisateur ou avatar")),
      );
      return;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Text(
          'Modification du compte',
        ),
      ),
      body: Center(
        child: Container(
          height: 900,
          width: 600,
          decoration: BoxDecoration(
            color: Color.fromRGBO(169, 213, 243, 1.0),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              width: 1,
            ),
          ),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                Padding(
                    padding: const EdgeInsets.only(
                        left: 30.0, bottom: 15.0, right: 30.0, top: 20),
                    child: Container(
                      width: picturePath.isEmpty ? 250 : 150,
                      height: picturePath.isEmpty ? 250 : 260,
                      decoration: BoxDecoration(
                        color: Color.fromARGB(255, 253, 253, 253),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: Color.fromARGB(255, 0, 0, 0),
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
                                            if(number>=0){
                                              setState(() {
                                                isIcon = true;
                                              });
                                            }
                                          }catch(e){
                                            print("Erreur de parsage en int pour le FileImage");
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
                                      File? imageFile =
                                          await Navigator.pushNamed(
                                                  context, '/cameraScreen')
                                              as File?;
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
                                isIcon? Center(
                                  child: Image.memory(decodedBytesList[number], height:180 ,width: 180),
                                ):Center(
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
                    )),
                Padding(
                  padding: const EdgeInsets.only(
                      left: 30.0, bottom: 15.0, right: 30.0, top: 50),
                  child: TextFormField(
                    controller: usernameValidationController,
                    decoration: const InputDecoration(
                      hintText: "Entrez votre nom d'utilisateur",
                      icon: Icon(Icons.account_box),
                      border: OutlineInputBorder(),
                    ),
                    validator: (String? value) {
                      if (value == null || value.isEmpty) {
                        return "Entrez votre nom d'utilisateur";
                      } else if (value != widget.username) {
                        return "Le nom utilisateur est incorrect";
                      }
                      return null;
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(
                      left: 30.0, bottom: 15.0, right: 30.0, top: 20),
                  child: TextFormField(
                    controller: newUsernameController,
                    decoration: const InputDecoration(
                      hintText: "Nouveau nom d'utilisateur",
                      border: OutlineInputBorder(),
                      icon: Icon(Icons.account_box),
                    ),
                    validator: (String? value) {
                      if (value != '' && value!.length < 5) {
                        return "Un nom d'utilisateur doit au moins contenir 5 caractéres.";
                      } else if (value != '' &&
                          !value!.contains(RegExp(r'^[a-zA-Z0-9]+$'))) {
                        return "Un nom d'utilisateur ne doit contenir que des lettres ou des chiffres";
                      }
                      return null;
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: ElevatedButton(
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        modifyAccountInfo();
                      }
                    },
                    child: Icon(Icons.done),
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
