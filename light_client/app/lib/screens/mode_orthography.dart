//import 'dart:ffi';

import 'dart:async';
import 'dart:math';

import 'package:app/services/socket_client.dart';
import 'package:app/services/translate_service.dart';
import 'package:app/widgets/parent_widget.dart';
import 'package:flutter/material.dart';
import "package:app/services/api_service.dart";
import 'package:app/main.dart';
import 'package:app/models/words_orthography_model.dart';

import '../models/personnalisation.dart';
import '../services/user_infos.dart';

class ModeOrthography extends StatefulWidget {
  @override
  _ModeOrthographyState createState() => _ModeOrthographyState();
}

class _ModeOrthographyState extends State<ModeOrthography> {
  List<dynamic> allWords = [];
  List<dynamic> wordOfTraining = [];
  dynamic currentWord = [];
  int stateWord = 0;
  int numberWordsTotal = 3;
  int chances = 3;
  bool hasStarted = false;
  bool hideButton = false;
  bool gameOver = false;
  bool modeDone = false;
  bool successMessage = false;
  int score = 0;
  List<dynamic> bestScores = [];
  int bestScore = 0;
  String username = getIt<UserInfos>().user;
  int countdown = 0;
  String lang = "en";
  String theme = "dark";
  TranslateService translate = new TranslateService();

  @override
  void initState() {
    super.initState();
    getConfigs();
    handleSockets();
  }

  getConfigs() {
    getIt<SocketService>().send("get-config");
  }

  @override
  void dispose() {
    print("dispose mode orthography");
    super.dispose();
  }

  void handleSockets() async {
    ApiService().getAllWords().then((response) {
      setState(() {
        allWords = response;
        print(response.runtimeType);
        print(allWords.runtimeType);
        for (var i = 0; i < numberWordsTotal; i++) {
          final randomIndex = Random().nextInt(allWords.length);
          wordOfTraining.add(allWords[randomIndex]);
          allWords.removeAt(randomIndex);
        }
        currentWord = wordOfTraining[stateWord];
      });
    }).catchError((error) {
      print('Error fetching words: $error');
    });

    ApiService().getAllBestScores().then((response) {
      setState(() {
        bestScores = response;
        print("LE MEILLEUR SCORE");
        print(bestScores);
        for (dynamic element in bestScores) {
          if (element['name'] == username) {
            bestScore = element['score'];
          }
        }
        print(bestScore);
      });
    }).catchError((error) {
      print('Error fetching best score: $error');
    });

    getIt<SocketService>().on("get-config", (value) {
      lang = value['langue'];
      theme = value['theme'];

      if (mounted) {
        setState(() {
          lang = value['langue'];
          theme = value['theme'];
        });
      }
    });

    // getIt<SocketService>().on('sendUsername', (name) {
    //   try {
    //     if (mounted) {
    //       setState(() {
    //        username=name;
    //       });
    //     }
    //   } catch (e) {
    //     print(e);
    //   }
    // });
  }

  void connect() {
    // getIt<SocketService>().send('sendUsername');
  }

  void onClick(wordItem) {
    if (wordItem['answer']) {
      if (chances == 3) {
        setState(() {
          score += 20;
        });
      } else if (chances == 2) {
        setState(() {
          score += 10;
        });
      } else if (chances == 1) {
        setState(() {
          score += 5;
        });
      }
      setState(() {
        successMessage = true;
      });
      verifyIfModeDone();
    } else {
      setState(() {
        chances--;
      });
      if (chances == 0) {
        setState(() {
          gameOver = true;
        });
        getIt<SocketService>().send('score-orthography', score);
      }
    }
  }

  void leavePage() {
    Navigator.pop(context);
  }

  void startCountdown() {
    setState(() {
      hideButton = true;
      countdown = 3;
    });

    Timer.periodic(Duration(seconds: 1), (timer) {
      setState(() {
        countdown--;
      });

      if (countdown == 0) {
        setState(() {
          hasStarted = true;
        });
        timer.cancel();
      }
    });
  }

  dynamic shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      final j = Random().nextInt(i + 1);
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  void verifyIfModeDone() {
    if (stateWord + 1 != numberWordsTotal) {
      stateWord++;
      currentWord = wordOfTraining[stateWord];
      currentWord = shuffleArray(currentWord);
      setState(() {
        successMessage = false;
      });

      print(currentWord);
    } else {
      setState(() {
        modeDone = true;
        hasStarted = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return ParentWidget(
        child: Scaffold(
      body: Container(
        color: theme == "dark"
            ? Color.fromARGB(255, 68, 98, 68)
            : Color.fromARGB(255, 178, 227, 180),
        padding: EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            Text(
              translate.translateString(
                  lang, "Bienvenue au mode entrainement orthographe"),
              style: TextStyle(
                  fontSize: 30.0,
                  color: theme == "dark"
                      ? Color.fromARGB(255, 0, 0, 0)
                      : Color(0xFF0c5c03)),
            ),
            if (countdown > 0) Text("$countdown"),
            SizedBox(height: 16.0),
            if (!hideButton)
              ElevatedButton(
                style: ButtonStyle(
                  backgroundColor: MaterialStateProperty.all(theme == "dark"
                      ? Color.fromARGB(255, 95, 158, 110)
                      : Color.fromARGB(255, 95, 158, 110)),
                ),
                onPressed: hideButton ? null : startCountdown,
                child: Text(
                    translate.translateString(lang, "Commencer l'entraînement"),
                    style: TextStyle(color: Colors.white)),
              ),
            SizedBox(height: 16.0),
            Visibility(
              visible: countdown == 0 && !gameOver,
              child: hasStarted
                  ? Container(
                      width: 200,
                      padding: EdgeInsets.symmetric(vertical: 16.0),
                      decoration: BoxDecoration(
                        color: Color.fromARGB(
                            255, 133, 175, 135), // Couleur de fond beige
                        borderRadius:
                            BorderRadius.circular(8.0), // Bord arrondi
                      ),
                      child: Column(
                        children: [
                          for (var word in currentWord)
                            Padding(
                              padding: EdgeInsets.symmetric(vertical: 8.0),
                              child: ElevatedButton(
                                style: ButtonStyle(
                                  backgroundColor: MaterialStateProperty.all(
                                      Color(0xFF0c5c03)),
                                ),
                                child: Text("${word['word']}",
                                    style: TextStyle(color: Colors.white)),
                                onPressed: () => onClick(word),
                              ),
                            ),
                        ],
                      ))
                  : Container(),
            ),
            SizedBox(height: 16.0),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Stack(
                  children: [
                    Container(
                      width: 100.0,
                      height: 16.0,
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.black),
                        borderRadius: BorderRadius.circular(8.0),
                      ),
                    ),
                    Container(
                      width: (chances / 3) * 100.0,
                      height: 16.0,
                      decoration: BoxDecoration(
                        color: theme == "dark"
                            ? Color.fromARGB(255, 95, 158, 110)
                            : Color.fromARGB(255, 95, 158, 110),
                        borderRadius: BorderRadius.circular(8.0),
                      ),
                    ),
                  ],
                ),
                SizedBox(width: 8.0),
              ],
            ),
            Text(
              "Score : $score",
              style: TextStyle(
                  fontSize: 25.0,
                  color: theme == "dark"
                      ? Color.fromARGB(255, 0, 0, 0)
                      : Color(0xFF0c5c03)),
            ),
            Text(
              translate.translateString(lang, "Votre meilleur score") +
                  ": $bestScore",
              style: TextStyle(
                  fontSize: 25.0,
                  color: theme == "dark"
                      ? Color.fromARGB(255, 0, 0, 0)
                      : Color(0xFF0c5c03)),
            ),
            SizedBox(height: 16.0),
            ElevatedButton(
              style: ButtonStyle(
                backgroundColor: MaterialStateProperty.all(theme == "dark"
                    ? Color.fromARGB(255, 95, 158, 110)
                    : Color.fromARGB(255, 95, 158, 110)),
              ),
              onPressed: leavePage,
              child: Text(translate.translateString(lang, "Quitter"),
                  style: TextStyle(color: Colors.white)),
            ),
            SizedBox(height: 16.0),
            Visibility(
              visible: gameOver,
              child: Text(
                translate.translateString(lang, "Désolé, vous avez perdu !"),
                style: TextStyle(
                    fontSize: 24.0,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0c5c03)),
              ),
            ),
            Visibility(
              visible: modeDone,
              child: Text(
                translate.translateString(lang,
                    "Bien joué, vous avez fini le mode d'entraînement orthographe !"),
                style: TextStyle(
                    fontSize: 24.0,
                    fontWeight: FontWeight.bold,
                    color: theme == "dark"
                        ? Color.fromARGB(255, 0, 0, 0)
                        : Color(0xFF0c5c03)),
              ),
            ),
          ],
        ),
      ),
    ));
  }
}
