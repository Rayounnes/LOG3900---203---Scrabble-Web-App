import 'package:app/constants/widgets.dart';
import 'package:app/services/translate_service.dart';
import 'package:flutter/material.dart';

import 'package:app/main.dart';

import '../constants/letters_points.dart';
import '../models/personnalisation.dart';
import '../services/socket_client.dart';
import '../widgets/tile.dart';

class TileExchangeMenu extends StatefulWidget {
  final List<String> tileLetters;

  TileExchangeMenu({required this.tileLetters});

  @override
  _TileExchangeMenuState createState() => _TileExchangeMenuState();
}

class _TileExchangeMenuState extends State<TileExchangeMenu> {
  bool isChecked = false;
  final Map<int, bool> isCheckedList = {};
  List<int> indexToExchange = [];
  String lang = "en";
  TranslateService translate = TranslateService();

  @override
  void initState() {
    super.initState();
    initializeCheckList();
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

  void initializeCheckList() {
    setState(() {
      for (int i = 0; i < RACK_SIZE; i++) {
        isCheckedList[i] = false;
      }
    });
  }

  bool isLetterSelected() {
    if (isCheckedList.containsValue(true)) {
      return true;
    }
    return false;
  }

  List<int> sendLetterToExchange(int i) {
    setState(() {
      if (isCheckedList[i] == true) {
        indexToExchange.add(i);
      } else if (indexToExchange.contains(i)) {
        indexToExchange.removeWhere((index) => index == i);
      }
    });
    return indexToExchange;
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Dialog(
        child: Container(
          height: 700,
          width: 400,
          color: Color.fromARGB(255, 187, 225, 243),
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  translate.translateString(lang, 'Lettre à échanger'),
                  style: TextStyle(fontSize: 30, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 50.0),
                for (int i = 0; i < widget.tileLetters.length; i++)
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        TileWidget(
                            letter: widget.tileLetters[i],
                            points: widget.tileLetters[i].toUpperCase() ==
                                    widget.tileLetters[i]
                                ? "0"
                                : LETTERS_POINTS[widget.tileLetters[i]]
                                    .toString()),
                        Checkbox(
                          checkColor: Color.fromARGB(255, 61, 59, 58),
                          activeColor: Color.fromARGB(255, 255, 238, 84),
                          value: isCheckedList[i],
                          onChanged: (bool? value) {
                            setState(() {
                              isCheckedList[i] = value!;
                              sendLetterToExchange(i);
                            });
                          },
                        ),
                      ],
                    ),
                  ),
                SizedBox(height: 50.0),
                Padding(
                  padding: EdgeInsets.only(left: 190),
                  child: Row(
                    children: [
                      ElevatedButton(
                        onPressed: () {
                          Navigator.of(context).pop("");
                        },
                        child: Text(translate.translateString(lang, 'Annuler')),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(left: 50),
                        child: ElevatedButton(
                          onPressed: isLetterSelected()
                              ? () {
                                  var lettersToExchange = '';
                                  for (int index in indexToExchange) {
                                    lettersToExchange +=
                                        widget.tileLetters[index];
                                  }
                                  print(
                                      "letters to exchange: $lettersToExchange");
                                  Navigator.of(context).pop(lettersToExchange);
                                }
                              : null,
                          child: Text('Ok'),
                        ),
                      ),
                    ],
                  ),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
