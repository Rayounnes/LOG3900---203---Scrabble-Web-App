import 'package:app/main.dart';
import 'package:app/services/socket_client.dart';
import 'package:flutter/material.dart';
import 'package:app/widgets/movable_container.dart';
import 'package:intl/intl.dart';
import 'package:app/models/chat_message_model.dart';
import 'package:app/widgets/chat_message.dart';
import 'package:app/services/user_infos.dart';

class GamePage extends StatefulWidget {
  const GamePage({super.key});

  @override
  State<GamePage> createState() => _GamePageState();
}

class Painter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final cellWidth = size.width / 15;
    final cellHeight = size.height / 15;
    final linePaint = Paint()
      ..color = Color.fromARGB(255, 0, 0, 0)
      ..strokeWidth = 3;
    final fillPaint = Paint();

    for (int i = 0; i <= 15; i++) {
      canvas.drawLine(
        Offset(0, i * cellHeight),
        Offset(size.width, i * cellHeight),
        linePaint,
      );
      canvas.drawLine(
        Offset(i * cellWidth, 0),
        Offset(i * cellWidth, size.height),
        linePaint,
      );

      if (i < 15) {
        for (int j = 0; j < 15; j++) {
          fillPaint.color = j % 2 == 0
              ? Color.fromARGB(255, 153, 167, 245)
              : Color.fromARGB(255, 255, 186, 140);

          final cellRect = Rect.fromLTWH(
            i * cellWidth + 2,
            j * cellHeight + 2,
            cellWidth - 3,
            cellHeight - 3,
          );
          canvas.drawRect(cellRect, fillPaint);
        }
      }
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) {
    return false;
  }
}

class _GamePageState extends State<GamePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text(
            'Page de jeu',
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
          ),
        ),
        body: Column(children: <Widget>[
          Padding(
            padding: const EdgeInsets.only(top: 25, bottom: 40),
            child: FloatingActionButton(
              onPressed: () {
                print(1);
              },
              backgroundColor: Colors.blue,
              child: Icon(
                Icons.abc,
                color: Colors.white,
                size: 25,
              ),
            ),
          ),
          Center(
            child: CustomPaint(
              painter: Painter(),
              size: Size(675, 675),
            ),
          ),
        ]));
  }
}
