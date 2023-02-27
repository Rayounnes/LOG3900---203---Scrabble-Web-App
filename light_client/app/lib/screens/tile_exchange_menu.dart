import 'package:app/constants/widgets.dart';
import 'package:flutter/material.dart';

import 'package:app/main.dart';

import '../services/socket_client.dart';

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

  @override
  void initState() {
    super.initState();
    initializeCheckList();
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
        indexToExchange.removeAt(i);
      }
    });
    return indexToExchange;
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Dialog(
        child: Container(
          height: 1000,
          width: 600,
          color: Color.fromARGB(255, 187, 225, 243),
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Lettre à échanger',
                  style: TextStyle(fontSize: 30, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 50.0),
                for (int i = 0; i < RACK_SIZE; i++)
                  CheckboxListTile(
                    checkColor: Color.fromARGB(255, 61, 59, 58),
                    activeColor: Color.fromARGB(255, 255, 238, 84),
                    title: Text(
                      'Option $i : ${widget.tileLetters[i]}',
                      style: TextStyle(fontSize: 24),
                    ),
                    value: isCheckedList[i],
                    onChanged: (bool? value) {
                      setState(() {
                        isCheckedList[i] = value!;
                        sendLetterToExchange(i);
                      });
                    },
                    contentPadding: EdgeInsets.all(20),
                  ),
                SizedBox(height: 50.0),
                Padding(
                  padding: EdgeInsets.only(left: 190),
                  child: Row(
                    children: [
                      ElevatedButton(
                        onPressed: () {
                          Navigator.of(context).pop();
                        },
                        child: Text('Annuler'),
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
                                  getIt<SocketService>().send(
                                      'exchange-command', lettersToExchange);
                                  Navigator.of(context).pop(widget.tileLetters);
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
