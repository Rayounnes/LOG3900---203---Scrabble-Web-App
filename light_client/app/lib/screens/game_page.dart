import 'dart:collection';

import 'package:app/main.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/widgets/parent_widget.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:app/models/chat_message_model.dart';
import 'package:app/widgets/chat_message.dart';
import 'package:app/services/user_infos.dart';

import '../constants/widgets.dart';
import '../services/tile_placement.dart';

class GamePage extends StatefulWidget {
  const GamePage({super.key});

  @override
  State<GamePage> createState() => _GamePageState();
}

class Board extends CustomPainter {
  Color rectColor = Color(0xff000000);
  Size rectSize = Size(50, 50);
  @override
  void paint(Canvas canvas, Size size) {
    final vLines = (size.width ~/ TILE_SIZE) + 1;
    final hLines = (size.height ~/ TILE_SIZE) + 1;

    final paintRack = Paint()
      ..strokeWidth = 1
      ..color = Color.fromARGB(255, 239, 181, 64)
      ..style = PaintingStyle.fill;

    final paint = Paint()
      ..strokeWidth = 1
      ..color = Color.fromARGB(255, 247, 246, 246)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final paintRed = Paint()
      ..strokeWidth = 1
      ..color = Color.fromARGB(255, 192, 112, 112)
      ..style = PaintingStyle.fill;

    final paintBlue = Paint()
      ..strokeWidth = 1
      ..color = Color.fromARGB(255, 111, 186, 244)
      ..style = PaintingStyle.fill;

    final paintPink = Paint()
      ..strokeWidth = 1
      ..color = Color.fromARGB(255, 249, 168, 190)
      ..style = PaintingStyle.fill;

    final paintDarkBlue = Paint()
      ..strokeWidth = 1
      ..color = Color.fromARGB(255, 75, 50, 238)
      ..style = PaintingStyle.fill;

    final path = Path();

    // rack
    for (var i = 4; i < 12; ++i) {
      final x = TILE_SIZE * i;
      path.moveTo(x, TILE_SIZE * 17);
      path.relativeLineTo(0, TILE_SIZE);
    }

    // Draw horizontal lines
    for (var i = 17; i < 19; ++i) {
      final y = TILE_SIZE * i;
      path.moveTo(TILE_SIZE * 4, y);
      path.relativeLineTo(TILE_SIZE * 7, 0);
    }

    // fill rack
    for (var i = 4; i < 11; i += 1) {
      final x = TILE_SIZE * i;
      final y = 17 * TILE_SIZE;
      canvas.drawRect(Offset(x, y) & rectSize, paintRack);
    }

    for (var j = 1; j < 15; j += 4) {
      // Dark blue
      for (var i = 1; i < 15; i += 4) {
        final x = TILE_SIZE * i;
        final y = TILE_SIZE * j;
        canvas.drawRect(Offset(x, y) & rectSize, paintDarkBlue);
      }
    }

    // Pink
    for (var i = 0; i < 4; i += 1) {
      final left = TILE_SIZE * 1;
      final right = TILE_SIZE * 13;
      final x = TILE_SIZE * i;

      canvas.drawRect(Offset(left + x, left + x) & rectSize, paintPink);
      canvas.drawRect(Offset(left + x, right - x) & rectSize, paintPink);
      canvas.drawRect(Offset(right - x, left + x) & rectSize, paintPink);
      canvas.drawRect(Offset(right - x, right - x) & rectSize, paintPink);
    }

    for (var j = 0; j < 15; j += 14) {
      // Light blue 1
      for (var i = 3; i < 15; i += 8) {
        final x = TILE_SIZE * i;
        final y = TILE_SIZE * j;
        canvas.drawRect(Offset(x, y) & rectSize, paintBlue);
      }
    }

    for (var j = 2; j < 15; j += 10) {
      // Light blue 2
      for (var i = 6; i <= 8; i += 2) {
        final x = TILE_SIZE * i;
        final y = TILE_SIZE * j;
        canvas.drawRect(Offset(x, y) & rectSize, paintBlue);
      }
    }

    for (var j = 3; j < 15; j += 8) {
      // Light blue 3
      for (var i = 0; i < 15; i += 7) {
        final x = TILE_SIZE * i;
        final y = TILE_SIZE * j;
        canvas.drawRect(Offset(x, y) & rectSize, paintBlue);
      }
    }

    for (var j = 6; j <= 8; j += 2) {
      // Light blue 4
      for (var i = 2; i <= 12; i += 10) {
        final x = TILE_SIZE * i;
        final y = TILE_SIZE * j;
        canvas.drawRect(Offset(x, y) & rectSize, paintBlue);
      }
    }

    for (var j = 6; j <= 8; j += 2) {
      // Light blue 5
      for (var i = 6; i <= 8; i += 2) {
        final x = TILE_SIZE * i;
        final y = TILE_SIZE * j;
        canvas.drawRect(Offset(x, y) & rectSize, paintBlue);
      }
    }

    // Light blue 6
    for (var i = 3; i <= 11; i += 8) {
      final x = TILE_SIZE * i;
      final yCenter = TILE_SIZE * 7;

      canvas.drawRect(Offset(x, yCenter) & rectSize, paintBlue);
    }

    for (var j = 0; j < 15; j += 7) {
      // RED
      for (var i = 0; i < 15; i += 7) {
        final x = TILE_SIZE * i;
        final y = TILE_SIZE * j;
        canvas.drawRect(Offset(x, y) & rectSize, paintRed);
      }
    }

    // Draw vertical lines
    for (var i = 0; i <= 15; ++i) {
      final x = TILE_SIZE * i;
      path.moveTo(x, 0);
      path.relativeLineTo(0, TILE_SIZE * 15);
    }

    // Draw horizontal lines
    for (var i = 0; i < 16; ++i) {
      final y = TILE_SIZE * i;
      path.moveTo(0, y);
      path.relativeLineTo(TILE_SIZE * 15, 0);
    }
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) {
    return false;
  }
}

class _GamePageState extends State<GamePage> {
  List<int> tileWidgets = [0, 1, 2, 3];
  final Map<int, Offset> position = Map();

  @override
  void initState() {
    super.initState();
    for (var index in tileWidgets) {
      position[index] = getIt<TilePlacement>().setTileOnRack(index);
    }
  }

  setTileOnBoard(Offset offset, int tileID) {
    return getIt<TilePlacement>()
        .setTileOnBoard(Offset(offset.dx, offset.dy - 78), tileID);
  }

  @override
  Widget build(BuildContext context) {
    return ParentWidget(child: Scaffold(
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
              heroTag: "btn2",
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
            child: Container(
              height: 750,
              width: 750,
              color: Color.fromRGBO(243, 174, 72, 1),
              child: Center(
                child: CustomPaint(
                  painter: Board(),
                  size: Size(750, 750),
                ),
              ),
            ),
          ),
          for (var i in tileWidgets)
            Positioned(
                left: position[i]?.dx,
                top: position[i]?.dy,
                child: Center(
                  child: Draggable(
                    feedback: Container(
                      width: TILE_SIZE,
                      height: TILE_SIZE,
                      color: Color.fromARGB(255, 0, 109, 42).withOpacity(0.5),
                    ),
                    child: AnimatedContainer(
                      duration: Duration(seconds: 1),
                      color: Color.fromARGB(255, 20, 20, 20),
                      height: TILE_SIZE,
                      width: TILE_SIZE,
                      child: Center(
                        child: Text(
                          'H',
                          style: TextStyle(fontSize: 35, color: Colors.white),
                        ),
                      ),
                    ),
                    onDraggableCanceled: (velocity, offset) {
                      setState(() {
                        Offset value = setTileOnBoard(offset, i);
                        position[i] = value;
                      });
                    },
                  ),
                )),
          Positioned(
            left: 370,
            bottom: 45,
            child: FloatingActionButton(
              heroTag: "btn3",
              onPressed: () {
                print("position");
              },
              backgroundColor: Color.fromARGB(255, 243, 33, 33),
              child: Icon(
                Icons.abc,
                color: Color.fromARGB(255, 184, 187, 173),
                size: 25,
              ),
            ),
          )
        ])),);
  }
}
