import 'dart:convert';
import 'dart:typed_data';

import 'package:app/constants/widgets.dart';
import 'package:app/screens/game_mode_choices.dart';
import 'package:app/screens/mode_orthography.dart';
import 'package:app/screens/user_account_page.dart';
import 'package:app/services/translate_service.dart';
import 'package:app/widgets/button.dart';
import 'package:app/widgets/parent_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../constants/constants.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/main.dart';
import 'package:app/services/user_infos.dart';
import 'package:app/services/api_service.dart';

import '../models/personnalisation.dart';
import '../widgets/loading_tips.dart';

class GameModes extends StatefulWidget {
  final String name;

  const GameModes({super.key, this.name = ''});

  @override
  State<GameModes> createState() => _GameModesState();
}

class _GameModesState extends State<GameModes> {
  List<dynamic> connexionHistory = [];
  List<dynamic> iconList = [];
  Uint8List decodedBytes = Uint8List(1);
  String userName = "user";
  int userPoints = 100;
  Personnalisation langOrTheme =
      new Personnalisation(language: "fr", theme: "light");
  String lang = "en";
  TranslateService translate = new TranslateService();
  int _selectedButton = 1;
  int _selectedThemeButton = 1;
  bool _darkMode = false;
  String theme = "light";
  // String selectedLanguage = "fr";
  bool _isDarkMode = false;

  List<bool> _isSelected = [false, false, false];

  void _onButtonSelected(int? value) {
    setState(() {
      _selectedButton = value!;
      setLanguage();
    });
  }

  void setLanguage() {
    langOrTheme.language = _selectedButton == 1 ? "fr" : "en";

    getIt<SocketService>().send("update-config", langOrTheme);
    lang = langOrTheme.language;
  }

  void setTheme() {
    langOrTheme.theme = _selectedThemeButton == 1 ? "dark" : "light";

    getIt<SocketService>().send("update-config", langOrTheme);
    theme = langOrTheme.theme;
  }

  void _onButtonThemeSelected(int? value) {
    setState(() {
      _selectedThemeButton = value!;
      setTheme();
    });
  }

  @override
  void initState() {
    super.initState();
    getUserInfo();
    getConfigs();
    handleSockets();
    initNotifications();
  }

  getConfigs() {
    getIt<SocketService>().send("get-config");
  }

  @override
  void dispose() {
    super.dispose();
  }

  FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  void initNotifications() async {
    var initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    var initializationSettings =
        InitializationSettings(android: initializationSettingsAndroid);
    await flutterLocalNotificationsPlugin.initialize(initializationSettings);
  }

  void showNotification(String message, String channel) async {
    var androidDetails = AndroidNotificationDetails(
        'channel_id', 'Channel Name',
        importance: Importance.max,
        priority: Priority.high,
        showWhen: false,
        color: Color(0xFF2196F3));

    var notificationDetails = NotificationDetails(android: androidDetails);

    await flutterLocalNotificationsPlugin.show(
        0,
        translate.translateString(lang, 'Nouveau message dans ') + '$channel',
        message,
        notificationDetails);
  }

  void handleSockets() {
    getIt<SocketService>().on("notify-message", (message) async {
      try {
        if (mounted) {
          setState(() async {
            showNotification(message['message'], message['channel']);
          });
        }
      } catch (e) {
        print(e);
      }
    });

    getIt<SocketService>().on("get-config", (value) {
      lang = value['language'];
      theme = value['theme'];
      if (mounted) {
        setState(() {
          lang = value['language'];
          _selectedButton = (lang == 'fr') ? 1 : 2;
          _selectedThemeButton = (theme == 'dark') ? 1 : 2;
        });
      }
    });
  }

  void getUserInfo() async {
    if (mounted) {
      userName = widget.name != '' ? widget.name : getIt<UserInfos>().user;
      iconList = await ApiService().getUserIcon(userName);
      connexionHistory = await ApiService().getConnexionHistory(userName);
      decodedBytes =
          base64Decode(iconList[0].toString().substring(BASE64PREFIX.length));
    }
  }

  void logoutUser() async {
    String username = getIt<UserInfos>().user;
    await ApiService().logoutUser(username);
    getIt<SocketService>().disconnect();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
          backgroundColor: theme == "dark"
              ? Color.fromARGB(255, 32, 107, 34)
              : Color.fromARGB(255, 207, 241, 207),
          duration: Duration(seconds: 3),
          content: Text(translate.translateString(
              lang, "Vous avez été déconnecté avec succés"))),
    );
    Navigator.pushNamed(context, '/loginScreen');
  }

  @override
  Widget build(BuildContext context) {
    return ParentWidget(
        theme: theme,
        child: Stack(
          children: [
            // Positioned(
            //   top: 80,
            //   left: 300,
            //   child: Column(
            //     mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            //     children: <Widget>[
            //       ElevatedButton(
            //         onPressed: () {
            //           _onButtonThemeSelected(1);
            //         },
            //         style: ElevatedButton.styleFrom(
            //           primary: _selectedButton == 1
            //               ? Color.fromARGB(255, 47, 60, 47)
            //               : Colors.grey,
            //         ),
            //         child: Icon(Icons.dark_mode),
            //       ),
            //       ElevatedButton(
            //         onPressed: () {
            //           _onButtonThemeSelected(2);
            //         },
            //         style: ElevatedButton.styleFrom(
            //           primary:
            //               _selectedThemeButton == 2 ? Colors.green : Colors.grey,
            //         ),
            //         child: Icon(Icons.light_mode),
            //       ),
            //     ],
            //   ),
            // ),
            Positioned(
              top: 160,
              left: 550,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: <Widget>[
                  ElevatedButton(
                    onPressed: () {
                      _onButtonThemeSelected(1);
                    },
                    style: ElevatedButton.styleFrom(
                      primary: (_selectedThemeButton == 1)
                          ? Color.fromARGB(255, 0, 0, 0)
                          : Colors.grey,
                    ),
                    child: Icon(Icons.dark_mode),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      _onButtonThemeSelected(2);
                    },
                    style: ElevatedButton.styleFrom(
                      primary: (_selectedThemeButton == 2)
                          ? Color.fromARGB(255, 255, 255, 255)
                          : Colors.grey,
                    ),
                    child: Icon(Icons.light_mode),
                  ),
                ],
              ),
            ),
            Positioned(
              top: 160,
              left: 150,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: <Widget>[
                  ElevatedButton(
                    onPressed: () {
                      _onButtonSelected(1);
                    },
                    style: ElevatedButton.styleFrom(
                      primary: (_selectedButton == 1 && lang == 'fr')
                          ? Color.fromARGB(255, 156, 237, 158)
                          : Colors.grey,
                    ),
                    child: Text('Français'),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      _onButtonSelected(2);
                    },
                    style: ElevatedButton.styleFrom(
                      primary: (_selectedButton == 2 && lang == 'en')
                          ? Color.fromARGB(255, 156, 237, 158)
                          : Colors.grey,
                    ),
                    child: Text('English'),
                  ),
                ],
              ),
            ),
            Center(
              child: Container(
                height: 750,
                width: 500,
                decoration: BoxDecoration(
                  color: theme == "dark"
                      ? Color.fromARGB(255, 203, 201, 201)
                      : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    width: 1,
                    color: Colors.grey,
                  ),
                ),
                child: Column(
                  children: <Widget>[
                    Padding(
                      padding: const EdgeInsets.only(top: 60.0),
                      child: Text(
                          translate.translateString(
                              lang, 'Application Scrabble'),
                          style: TextStyle(
                            fontSize: 23,
                            color: Colors.black,
                            fontWeight: FontWeight.w700,
                          )),
                    ),
                    SizedBox(height: 16.0),
                    GameButton(
                        theme: theme,
                        padding: 20.0,
                        name: translate.translateString(
                            lang, "Mode de jeu classique"),
                        route: () {
                          Navigator.push(context,
                              MaterialPageRoute(builder: (context) {
                            return GameChoices(
                              modeName: GameNames.classic,
                            );
                          }));
                        }),
                    GameButton(
                        theme: theme,
                        padding: 20.0,
                        name: translate.translateString(
                            lang, "Mode de jeu coopératif"),
                        route: () {
                          Navigator.push(context,
                              MaterialPageRoute(builder: (context) {
                            return GameChoices(
                              modeName: GameNames.cooperative,
                            );
                          }));
                        }),
                    GameButton(
                        theme: theme,
                        padding: 20.0,
                        name: translate.translateString(
                            lang, "Mode d'entrainement orthographe"),
                        route: () {
                          Navigator.push(context,
                              MaterialPageRoute(builder: (context) {
                            return ModeOrthography();
                          }));
                        }),
                    GameButton(
                        theme: theme,
                        padding: 20.0,
                        name: translate.translateString(lang, "Profil"),
                        route: () {
                          Navigator.push(context,
                              MaterialPageRoute(builder: (context) {
                            getUserInfo();
                            return UserAccountPage(
                              connexionHistory: connexionHistory,
                              deconnectionHistory: connexionHistory,
                              userName: userName,
                              decodedBytes: decodedBytes,
                            );
                          }));
                        }),
                    GameButton(
                        theme: theme,
                        padding: 20.0,
                        name: translate.translateString(lang, "Aide"),
                        route: () {
                          Navigator.pushNamed(context, '/helpScreen');
                        }),
                    GameButton(
                        theme: theme,
                        padding: 20.0,
                        name: translate.translateString(lang, "Déconnexion"),
                        route: () {
                          showModal(context);
                        })
                  ],
                ),
              ),
            ),
            Align(alignment: Alignment.bottomCenter, child: LoadingTips(lang)),
          ],
        ));
  }

  void showModal(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) => AlertDialog(
        title: Text(translate.translateString(lang, 'Déconnexion')),
        content: Text(translate.translateString(
            lang, 'Etes-vous sur de vous déconnecter ?')),
        actions: <TextButton>[
          TextButton(
            onPressed: () {
              logoutUser();
            },
            child: Text(translate.translateString(lang, 'Oui')),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
            },
            child: Text(translate.translateString(lang, 'Non')),
          ),
        ],
      ),
    );
  }
}
