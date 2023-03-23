import 'dart:convert';
import 'package:app/main.dart';
import 'package:app/models/tile.dart';
import 'package:app/screens/game_modes_page.dart';
import 'package:app/screens/tile_exchange_menu.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/widgets/information_pannel.dart';
import 'package:app/widgets/parent_widget.dart';
import 'package:app/widgets/tile.dart';
import 'package:flutter/material.dart';
import '../constants/letters_points.dart';
import '../constants/widgets.dart';
import '../services/tile_placement.dart';
import '../services/board.dart';
import '../models/letter.dart';

// Copyright 2019 The Flutter team. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

class GamePage extends StatefulWidget {
  final Function joinGameSocket;
  const GamePage({super.key, required this.joinGameSocket});

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
  List<Letter> lettersOpponent = [];
  bool isPlayerTurn = false;
  final List<String> letters =
      List.generate(26, (index) => String.fromCharCode(index + 65));
  String selectedLetter = '';
  @override
  void initState() {
    print("-------------------------Initiation game-page-------------------");
    super.initState();
    handleSockets();
    widget.joinGameSocket();
    getRack();
    setTileOnRack();
    selectedLetter = '';
  }

  void _showLetterPicker(int line, int column, int tileId) {
    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          child: Container(
            height: 400.0,
            child: GridView.builder(
              itemCount: letters.length,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 7,
              ),
              itemBuilder: (context, index) {
                return InkWell(
                  onTap: () {
                    setState(() {
                      selectedLetter = letters[index];
                      lettersofBoard
                          .add(Letter(line, column, selectedLetter, tileId));

                      tileLetter[tileId] = selectedLetter;
                      Navigator.pop(context);
                    });
                  },
                  child: TileWidget(letter: letters[index], points: "0"),
                );
              },
            ),
          ),
        );
      },
    );
  }

  verifyLetterOnBoard(int tileID) {
    for (var letter in lettersofBoard) {
      if (letter.tileID == tileID) {
        return true;
      }
    }
    return false;
  }

  removeLetterOnBoard(int tileID) {
    for (var letter in lettersofBoard) {
      if (letter.tileID == tileID) {
        lettersofBoard
            .removeWhere((element) => element.tileID == letter.tileID);
        String? letterValue = tileLetter[tileID];
        // on remet la tuile a * lorsqu on remet la tuile * dans le chevalet
        tileLetter[tileID] =
            letterValue!.toUpperCase() == letterValue ? '*' : letterValue;
        return;
      }
    }
  }

  Offset setTileOnBoard(Offset offset, int tileID) {
    Offset positionOnBoard =
        getIt<TilePlacement>().getTilePosition(offset, tileID);
    int line = ((positionOnBoard.dy - TOP_BOARD_POSITION) ~/ TILE_SIZE);
    int column = positionOnBoard.dx ~/ TILE_SIZE;

    String? letterValue = tileLetter[tileID];
    selectedLetter = '';
    bool isLetterInList = false;
    if (board.verifyRangeBoard(line, column)) {
      if (verifyLetterOnBoard(tileID)) {
        removeLetterOnBoard(tileID);
      }
      if (letterValue == '*') {
        _showLetterPicker(line, column, tileID);
      } else {
        lettersofBoard
            .add(Letter(line, column, letterValue!.toLowerCase(), tileID));
      }
    } else {
      removeLetterOnBoard(tileID);
    }

    return getIt<TilePlacement>().setTileOnBoard(offset, tileID);
  }

  void validatePlacement() {
    dynamic word = board.verifyPlacement(lettersofBoard);
    // On remet lettersOfBoard a une liste vide car ses lettres sont replacés
    lettersofBoard = [];
    if (word != null) {
      getIt<SocketService>().send('verify-place-message', word);
    } else {
      setTileOnRack();
    }
  }

  void setTileOnRack() {
    setState(() {
      for (var index in rackIDList) {
        isTileLocked[index] = false;
        tilePosition[index] = getIt<TilePlacement>().setTileOnRack(index);
        if (tileLetter[index]?.toUpperCase() == tileLetter[index])
          tileLetter[index] = '*';
      }
    });
  }

  void lockTileOnBoard(bool isForExchange) {
    for (var index in rackIDList) {
      if (tilePosition[index]?.dy != RACK_START_AXISY) {
        isTileLocked[index] = true;
      } else {
        removeTileOnRack(index);
      }
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

  void getRack() {
    getIt<SocketService>().send('draw-letters-rack');
  }

  void changeTurn() {
    print("sending change-turn from game-page");
    getIt<SocketService>().send('change-user-turn');
  }

  void handleSockets() {
    print("game page handle sockets");
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
                    updateRackID(true, opponentTileID),
                  }),
              board.isFilledForEachLetter(board.createOpponentLetters(letters)),
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
      if (placedWord["letters"] is String) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              backgroundColor: Colors.red,
              duration: Duration(seconds: 3),
              content: Text(placedWord["letters"])),
        );
        setState(() => setTileOnRack());
      } else {
        getIt<SocketService>().send('remove-letters-rack-light-client',
            jsonEncode(placedWord["letters"]));
        getIt<SocketService>().send('validate-created-words', placedWord);
      }
    });

    getIt<SocketService>().on('validate-created-words', (placedWord) async {
      getIt<SocketService>().send('freeze-timer');
      if (placedWord["points"] != 0) {
        final lettersjson = jsonEncode(placedWord["letters"]);
        getIt<SocketService>().send('draw-letters-opponent', placedWord);

        getIt<SocketService>().send('send-player-score');
        switchRack(false);
        board.isFilledForEachLetter(lettersofBoard);
      } else {
        await Future.delayed(Duration(seconds: 3));
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              backgroundColor: Colors.red,
              duration: Duration(seconds: 3),
              content: Text('Erreur : les mots crées sont invalides')),
        );
        setTileOnRack();
        changeTurn();
      }
      lettersofBoard = [];
    });
    getIt<SocketService>().on('exchange-command', (command) {
      if (command["type"] == 'system') {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              backgroundColor: Colors.red,
              duration: Duration(seconds: 2),
              content: Text(command["name"])),
        );
      } else {
        switchRack(true);
      }
    });
    getIt<SocketService>().on('user-turn', (playerTurnId) {
      setState(() {
        isPlayerTurn = playerTurnId == getIt<SocketService>().socketId;
      });
    });
  }

  void switchRack(bool isForExchange) {
    lockTileOnBoard(isForExchange);
    updateRackID(isForExchange, rackIDList);
    getRack();
    setTileOnRack();
    fillRack();
    changeTurn();
  }

  // Création des tuiles
  List<Widget> fillRack() {
    List<Widget> rackTiles = [];
    setState(() {
      for (var id in tilePosition.keys) {
        if (tileLetter[id] != '') {
          rackTiles.add(Positioned(
            left: tilePosition[id]?.dx,
            top: tilePosition[id]?.dy,
            child: Draggable(
              feedback: isTileLocked[id] == true
                  ? Container()
                  : TileWidget(
                      letter: tileLetter[id]!,
                      points: tileLetter[id]?.toUpperCase() == tileLetter[id]
                          ? "0"
                          : LETTERS_POINTS[tileLetter[id]].toString()),
              child: TileWidget(
                  letter: tileLetter[id]!,
                  points: tileLetter[id]?.toUpperCase() == tileLetter[id]
                      ? "0"
                      : LETTERS_POINTS[tileLetter[id]].toString()),
              onDraggableCanceled: (velocity, offset) {
                setState(() {
                  if (isTileLocked[id] != true && isPlayerTurn) {
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
      }
    });
    return rackTiles;
  }

  @override
  Widget build(BuildContext context) {
    return ParentWidget(
      child: Scaffold(
          appBar: AppBar(
            leadingWidth: 10,
            automaticallyImplyLeading: false,
            title: const Text(
              'Page de jeu',
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            actions: [
              FloatingActionButton(
                heroTag: "btn1",
                onPressed: () {
                  getIt<SocketService>().send('abandon-game');
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
              )
            ],
          ),
          body: Stack(children: <Widget>[
            Positioned(left: 0, top: 10, child: TimerPage()),
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
              top: RACK_START_AXISY,
              child: FloatingActionButton(
                heroTag: "passTurn",
                onPressed: !isPlayerTurn
                    ? null
                    : () {
                        setState(() {
                          getIt<SocketService>().send('pass-turn');
                          switchRack(true);
                        });
                      },
                backgroundColor: !isPlayerTurn
                    ? Colors.grey
                    : Color.fromARGB(255, 253, 174, 101),
                child: Icon(
                  Icons.double_arrow_rounded,
                  color: !isPlayerTurn
                      ? Colors.grey[200]
                      : Color.fromARGB(255, 0, 123, 172),
                  size: TILE_SIZE,
                ),
              ),
            ),
            Positioned(
              right: 45.0 + TILE_ADJUSTMENT,
              top: RACK_START_AXISY,
              child: FloatingActionButton(
                heroTag: "confirmPlacement",
                onPressed: !isPlayerTurn
                    ? null
                    : () {
                        setState(() {
                          validatePlacement();
                        });
                      },
                backgroundColor: !isPlayerTurn
                    ? Colors.grey[200]
                    : Color.fromARGB(255, 159, 201, 165),
                child: Icon(
                  Icons.check_box,
                  color: !isPlayerTurn
                      ? Colors.grey
                      : Color.fromARGB(255, 22, 82, 0),
                  size: TILE_SIZE,
                ),
              ),
            ),
            Positioned(
              left: LEFT_BOARD_POSITION + TILE_ADJUSTMENT,
              top: RACK_START_AXISY,
              child: FloatingActionButton(
                heroTag: "exchangeLetters",
                onPressed: !isPlayerTurn
                    ? null
                    : () {
                        showDialog<List<String>>(
                            context: context,
                            builder: (BuildContext context) {
                              List<String> exchangeableTile = [];
                              for (var index in rackIDList) {
                                exchangeableTile
                                    .add(tileLetter[index].toString());
                              }
                              return TileExchangeMenu(
                                tileLetters: exchangeableTile,
                              );
                            }).then((List<String>? result) {
                          if (result != null) {
                            // switchRack(true);
                          }
                        });
                      },
                backgroundColor: !isPlayerTurn
                    ? Colors.grey
                    : Color.fromARGB(255, 55, 151, 189),
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
