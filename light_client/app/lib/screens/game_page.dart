import 'dart:collection';
import 'dart:convert';

import 'package:app/main.dart';
import 'package:app/screens/game_modes_page.dart';
import 'package:app/screens/tile_exchange_menu.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/widgets/parent_widget.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart';
import 'package:intl/intl.dart';
import 'package:app/models/chat_message_model.dart';
import 'package:app/widgets/chat_message.dart';
import 'package:app/services/user_infos.dart';

import '../constants/widgets.dart';
import '../services/tile_placement.dart';
import '../services/board.dart';
import '../models/letter.dart';
import '../models/Words_Args.dart';
import '../models/placement.dart';

// Copyright 2019 The Flutter team. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

class _HorizontalDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      child: Column(
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                color: Colors.deepPurpleAccent,
              ),
            ),
          ),
          const Divider(
            color: Colors.grey,
            height: 20,
            thickness: 1,
            indent: 20,
            endIndent: 0,
          ),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                color: Colors.deepOrangeAccent,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class GamePage extends StatefulWidget {
  const GamePage({super.key});

  @override
  State<GamePage> createState() => _GamePageState();
}

class BoardPaint extends CustomPainter {
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
      path.moveTo(x, TILE_SIZE * 16);
      path.relativeLineTo(0, TILE_SIZE);
    }

    // Draw horizontal lines
    for (var i = 16; i < 18; ++i) {
      final y = TILE_SIZE * i;
      path.moveTo(TILE_SIZE * 4, y);
      path.relativeLineTo(TILE_SIZE * 7, 0);
    }

    // fill rack
    for (var i = 4; i < 11; i += 1) {
      final x = TILE_SIZE * i;
      final y = 16 * TILE_SIZE;
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
  final Map<int, Offset> tilePosition = {};
  final Map<int, String> tileLetter = {};
  final Map<int, bool> isTileLocked = {};
  final board = new Board();
  List<int> rackIDList = List.from(PLAYER_INITIAL_ID);
  List<int> opponentTileID = List.from(OPPONENT_INITIAL_ID);
  List<Letter> lettersofBoard = [];

  @override
  void initState() {
    super.initState();
    handleSockets();
    getReserveLetter();
    setTileOnRack();
  }

  Offset setTileOnBoard(Offset offset, int tileID) {
    Offset positionOnBoard =
        getIt<TilePlacement>().getTilePosition(offset, tileID);
    int line = ((positionOnBoard.dy - 150) ~/ 50);
    int column = positionOnBoard.dx ~/ 50;
    String? letterValue = tileLetter[tileID];
    print(line);
    print(column);
    print(getIt<TilePlacement>().getTilePosition(offset, tileID));

    lettersofBoard.add(Letter(line, column, letterValue!));
    return getIt<TilePlacement>().setTileOnBoard(offset, tileID);
  }

  void validatePlacement() {
    board.isFilledForEachLetter(lettersofBoard);
    dynamic word = board.verifyPlacement(lettersofBoard);
    if (word != null) {
      print("the word is valid");

      getIt<SocketService>().send('verify-place-message', word);
    } else {
      print("the word is invalid");
    }
  }

  void setTileOnRack() {
    setState(() {
      for (var index in rackIDList) {
        isTileLocked[index] = false;
        tilePosition[index] = getIt<TilePlacement>().setTileOnRack(index);
      }
    });
  }

  void lockTileOnBoard(bool isForExchange) {
    var lettersToExchange = '';
    for (var index in rackIDList) {
      if (tilePosition[index]?.dy != RACK_START_AXISY && !isForExchange) {
        lettersToExchange += "${tileLetter[index]}";
        isTileLocked[index] = true;
      } else {
        removeTileOnRack(index);
      }
    }
    if (lettersToExchange != '') {
      getIt<SocketService>().send('exchange-command', lettersToExchange);
    }
  }

  void removeTileOnRack(int index) {
    tilePosition.remove(index);
    isTileLocked.remove(index);
    tileLetter.remove(index);
  }

  void updateRackID(bool isForExchange, List<int> tileIDList) {
    setState(() {
      for (int i = 0; i < tileIDList.length; i++) {
        tileIDList[i] += RACK_SIZE;
      }
      if (!isForExchange) getIt<SocketService>().send('update-reserve');
    });
  }

  void getReserveLetter() {
    setState(() {
      getIt<SocketService>().send('draw-letters-rack');
    });
  }

  void changeTurn() {
    setState(() {
      getIt<SocketService>().send('change-user-turn');
    });
  }

  void handleSockets() {
    getIt<SocketService>().on('end-game', (val) => {});
    int index;
    int column;
    int line;
    getIt<SocketService>().on(
        'draw-letters-opponent',
        (letters) => {
              setState(() => {
                    index = opponentTileID[0],
                    for (var letter in letters)
                      {
                        isTileLocked[index] = true,
                        tileLetter[index] = letter["value"].toString(),
                        line = int.parse(letter["line"].toString()),
                        column = int.parse(letter["column"].toString()),
                        tilePosition[index] = getIt<TilePlacement>()
                            .getOpponentPosition(line, column),
                        index += 1,
                      },
                    updateRackID(true, opponentTileID)
                  })
            });

    getIt<SocketService>().on(
        'draw-letters-rack',
        (letters) => {
              setState(() {
                for (var index in rackIDList) {
                  tileLetter[index] = letters[index % RACK_SIZE].toString();
                }
              })
            });
    getIt<SocketService>().on('verify-place-message', (placedWord) {
      // getIt<SocketService>()
      if (placedWord["letters"] is String) {
        print("erreur le mot nest paas valide");
      } else {
        getIt<SocketService>()
            .send('remove-letters-rack', jsonEncode(placedWord["letters"]));
        getIt<SocketService>().send('validate-created-words', placedWord);
      }
    });

    getIt<SocketService>().on('validate-created-words', (placedWord) {
      if (placedWord["points"] != 0) {
        lettersofBoard = [];
        final lettersjson = jsonEncode(placedWord["letters"]);
        getIt<SocketService>().send('draw-letters-opponent', (lettersjson));

        getIt<SocketService>().send('send-player-score');
        switchRack(false);
        // getIt<SocketService>().send('freeze-timer');
      } else {
        setTileOnRack();
      }
    });
  }

  void switchRack(bool isForExchange) {
    lockTileOnBoard(isForExchange);
    updateRackID(isForExchange, rackIDList);
    getReserveLetter();
    setTileOnRack();
    fillRack();
    changeTurn();
  }

  // Création des tuiles
  List<Widget> fillRack() {
    List<Widget> rackTiles = [];
    setState(() {
      for (var id in tilePosition.keys) {
        rackTiles.add(Positioned(
          left: tilePosition[id]?.dx,
          top: tilePosition[id]?.dy,
          child: Draggable(
            feedback: Container(
              width: TILE_SIZE,
              height: TILE_SIZE,
              color: isTileLocked[id] == true
                  ? Color.fromARGB(0, 255, 255, 255)
                  : Color.fromARGB(255, 26, 219, 100).withOpacity(0.6),
            ),
            child: AnimatedContainer(
              duration: Duration(seconds: 1),
              color: Color.fromARGB(255, 39, 45, 46),
              height: TILE_SIZE,
              width: TILE_SIZE,
              child: Center(
                child: Text(
                  "${tileLetter[id]}",
                  style: TextStyle(
                      fontSize: 35, color: Color.fromARGB(255, 255, 255, 255)),
                ),
              ),
            ),
            onDraggableCanceled: (velocity, offset) {
              setState(() {
                if (isTileLocked[id] != true) {
                  offset = Offset(offset.dx, offset.dy - TILE_ADJUSTMENT);
                  Offset boardPosition = setTileOnBoard(offset, id);
                  if (!tilePosition.containsValue(boardPosition)) {
                    tilePosition[id] = boardPosition;
                  }
                }
              });
            },
          ),
        ));
      }
    });
    return rackTiles;
  }

  @override
  Widget build(BuildContext context) {
    return ParentWidget(
      child: Scaffold(
          appBar: AppBar(
            automaticallyImplyLeading: false,
            title: const Text(
              'Page de jeu',
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
          ),
          body: Stack(children: <Widget>[
            // Positioned(
            //   left: 370,
            //   top: 45,
            //   child: FloatingActionButton(
            //     heroTag: "btn0",
            //     onPressed: () {
            //       print(isTileLocked);
            //     },
            //     backgroundColor: Colors.blue,
            //     child: Icon(
            //       Icons.abc,
            //       color: Colors.white,
            //       size: 25,
            //     ),
            //   ),
            // ),
            Positioned(
              left: 370,
              top: 45,
              child: FloatingActionButton(
                heroTag: "btn0",
                onPressed: () {},
                backgroundColor: Colors.blue,
                child: Icon(
                  Icons.abc,
                  color: Colors.white,
                  size: 25,
                ),
              ),
            ),
            Positioned(
              left: LEFT_BOARD_POSITION,
              top: TOP_BOARD_POSITION,
              child: Container(
                height: 750,
                width: 750,
                color: Color.fromRGBO(243, 174, 72, 1),
                child: Center(
                  child: CustomPaint(
                    painter: BoardPaint(),
                    size: Size(750, 750),
                  ),
                ),
              ),
            ),
            ...fillRack(),
            Positioned(
              left: LEFT_BOARD_POSITION,
              bottom: LEFT_BOARD_POSITION,
              width: 100,
              child: FloatingActionButton(
                heroTag: "btn1",
                onPressed: () {
                  getIt<SocketService>().send('quit-game');
                  Navigator.push(context, MaterialPageRoute(builder: (context) {
                    return GameModes();
                  }));
                },
                backgroundColor: Color.fromARGB(255, 255, 110, 74),
                child: Icon(
                  Icons.output,
                  color: Color.fromARGB(255, 219, 224, 213),
                  size: TILE_SIZE,
                ),
              ),
            ),
            Positioned(
              left: LEFT_BOARD_POSITION,
              top: RACK_START_AXISY,
              child: FloatingActionButton(
                heroTag: "passTurn",
                onPressed: () {
                  setState(() {
                    getIt<SocketService>().send('pass-turn');
                    switchRack(true);
                  });
                },
                backgroundColor: Color.fromARGB(255, 253, 174, 101),
                child: Icon(
                  Icons.double_arrow_rounded,
                  color: Color.fromARGB(255, 0, 123, 172),
                  size: TILE_SIZE,
                ),
              ),
            ),
            Positioned(
              right: LEFT_BOARD_POSITION + TILE_ADJUSTMENT,
              top: RACK_START_AXISY,
              child: FloatingActionButton(
                heroTag: "confirmPlacement",
                onPressed: () {
                  setState(() {
                    validatePlacement();
                    // switchRack(false);
                  });
                },
                backgroundColor: Color.fromARGB(255, 159, 201, 165),
                child: Icon(
                  Icons.check_box,
                  color: Color.fromARGB(255, 22, 82, 0),
                  size: TILE_SIZE,
                ),
              ),
            ),
            Positioned(
              left: LEFT_BOARD_POSITION + TILE_ADJUSTMENT,
              top: RACK_START_AXISY,
              child: FloatingActionButton(
                heroTag: "exchangeLetters",
                onPressed: () {
                  showDialog<List<String>>(
                      context: context,
                      builder: (BuildContext context) {
                        List<String> exchangeableTile = [];
                        for (var index in rackIDList) {
                          exchangeableTile.add(tileLetter[index].toString());
                        }
                        return TileExchangeMenu(
                          tileLetters: exchangeableTile,
                        );
                      }).then((List<String>? result) {
                    if (result != null) {
                      switchRack(true);
                    }
                  });
                },
                backgroundColor: Color.fromARGB(255, 55, 151, 189),
                child: Icon(
                  Icons.compare_arrows,
                  color: Color.fromARGB(255, 255, 255, 255),
                  size: TILE_SIZE,
                ),
              ),
            )
          ])),
    );
  }
}
