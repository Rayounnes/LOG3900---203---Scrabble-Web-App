import 'package:app/services/socket_client.dart';
import 'package:app/services/translate_service.dart';
import 'package:flutter/material.dart';
import '../models/Words_Args.dart';
import 'package:app/main.dart';

class HintDialog extends StatefulWidget {
  String lang;
  HintDialog({required this.lang});

  @override
  State<HintDialog> createState() => _HintDialogState();
}

class _HintDialogState extends State<HintDialog> {
  List<WordArgs> formatedHints = [];
  bool hintReceived = false;
  TranslateService translate = new TranslateService();

  @override
  void initState() {
    print("-------------------------Initiation hint-------------------");
    super.initState();
    handleSockets();
    getIt<SocketService>().send('hint-command');
  }

  @override
  void dispose() {
    print("hint disposed");
    getIt<SocketService>().userSocket.off('hint-command');
    super.dispose();
  }

  void handleSockets() {
    print("hint handle sockets");

    getIt<SocketService>().on('hint-command', (placements) {
      setState(() {
        hintReceived = true;
        createWord(placements);
      });
    });
  }

  void createWord(List<dynamic> hints) {
    formatedHints = [];
    for (var hint in hints) {
      if (hint["command"] == 'Ces seuls placements ont été trouvés:') {
        continue;
      }

      if (hint["command"] ==
          "Aucun placement n'a été trouvé,Essayez d'échanger vos lettres !") {
        return;
      }

      var splitedCommand = hint["command"].split(' ');

      var columnWord = int.parse(
              splitedCommand[1].substring(1, splitedCommand[1].length - 1)) -
          1;
      var lineWord = splitedCommand[1][0].codeUnitAt(0) - 97;
      var valueWord = splitedCommand[splitedCommand.length - 1];
      var orientationWord = splitedCommand[1][splitedCommand[1].length - 1];
      if (orientationWord != "h" && orientationWord != "v")
        orientationWord = "h";
      formatedHints.add(WordArgs(
        line: lineWord,
        column: columnWord,
        value: valueWord,
        orientation: orientationWord,
        points: hint["points"],
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(translate.translateString(widget.lang, "Liste d'indices")),
      content: hintReceived
          ? SizedBox(
              width: 300,
              height: 600,
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: formatedHints.length,
                itemBuilder: (BuildContext context, int index) {
                  return GestureDetector(
                    onTap: () {
                      Navigator.pop(context, formatedHints[index]);
                    },
                    child: Card(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            formatedHints[index].value!,
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 8),
                          Text(
                              "Position: ${(formatedHints[index].line as int) + 1}, ${(formatedHints[index].column as int) + 1}"),
                          Text(
                              "Orientation: ${formatedHints[index].orientation}"),
                          Text("Points: ${formatedHints[index].points}"),
                        ],
                      ),
                    ),
                  );
                },
              ))
          : SizedBox(height: 20, width: 20, child: CircularProgressIndicator()),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.pop(context);
          },
          child: Text(translate.translateString(widget.lang, "Fermer")),
        ),
      ],
    );
  }
}
