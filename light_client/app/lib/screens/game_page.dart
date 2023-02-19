import 'package:app/main.dart';
import 'package:app/services/socket_client.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:app/models/chat_message_model.dart';
import 'package:app/widgets/chat_message.dart';
import 'package:app/services/user_infos.dart';

import '../services/tile_placement.dart';

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
              ? Color.fromARGB(255, 224, 253, 57)
              : Color.fromARGB(255, 228, 223, 220);

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
  Offset position = Offset(0.0, 0.0);
  double boxHeight = 46;
  double boxWidth = 46;

  setTile(Offset offset) {
    return getIt<TilePlacement>().setTile(Offset(offset.dx, offset.dy - 78));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text(
            'Page de jeu',
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
          ),
        ),
        body: Stack(children: <Widget>[
          Positioned(
            left: 370,
            top: 45,
            child: FloatingActionButton(
              onPressed: () {
                print(position);
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
              size: Size(750, 750),
            ),
          ),
          Positioned(
              left: position.dx,
              top: position.dy,
              child: Center(
                child: Draggable(
                  feedback: Container(
                    width: boxWidth,
                    height: boxHeight,
                    color: Color.fromARGB(255, 0, 109, 42).withOpacity(0.5),
                  ),
                  child: AnimatedContainer(
                    duration: Duration(seconds: 1),
                    color: Color.fromARGB(255, 172, 63, 235),
                    height: boxHeight,
                    width: boxWidth,
                  ),
                  onDraggableCanceled: (velocity, offset) {
                    setState(() {
                      position = setTile(offset);
                    });
                  },
                ),
              )),
          Positioned(
            left: 370,
            bottom: 45,
            child: FloatingActionButton(
              onPressed: () {
                print(position);
              },
              backgroundColor: Color.fromARGB(255, 243, 33, 33),
              child: Icon(
                Icons.abc,
                color: Color.fromARGB(255, 184, 187, 173),
                size: 25,
              ),
            ),
          )
        ]));
  }
}
