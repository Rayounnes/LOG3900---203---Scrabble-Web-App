import 'dart:convert';
import 'package:flutter/material.dart';

import 'package:app/main.dart';
import 'package:app/models/cooperative_action.dart';
import 'package:app/models/tile.dart';
import 'package:app/screens/game_modes_page.dart';
import 'package:app/screens/tile_exchange_menu.dart';
import 'package:app/services/music_service.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/widgets/cooperative_action.dart';
import 'package:app/widgets/information_pannel.dart';
import 'package:app/widgets/parent_widget.dart';
import 'package:app/widgets/tile.dart';
import 'package:flutter/material.dart';
import '../constants/letters_points.dart';
import '../constants/widgets.dart';
import '../models/personnalisation.dart';
import '../services/tile_placement.dart';
import '../services/board.dart';
import '../models/letter.dart';
import '../models/board_paint.dart';
// Copyright 2019 The Flutter team. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

class GamePage extends StatefulWidget {
  final bool isClassicMode;
  final Function joinGameSocket;
  const GamePage(
      {super.key, required this.isClassicMode, required this.joinGameSocket});

  @override
  State<GamePage> createState() => _GamePageState();
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
  bool commandSent = false;
  bool isEndGame = false;
  final List<String> letters =
      List.generate(26, (index) => String.fromCharCode(index + 65));
  String selectedLetter = '';
  MusicService musicService = MusicService();
  late Personnalisation langOrTheme;

  @override
  void initState() {
    print("-------------------------Initiation game-page-------------------");
    super.initState();
    handleSockets();
    widget.joinGameSocket();
    getRack();
    setTileOnRack();
    selectedLetter = '';
    if (!widget.isClassicMode) isPlayerTurn = true;
  }

  void leaveGame() {
    getIt<SocketService>().send('quit-game');
    Navigator.pop(context);
    Navigator.push(context, MaterialPageRoute(builder: (context) {
      return GameModes();
    }));
  }

  void openAbandonDialog(BuildContext context) {
    showDialog(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text("Abandonner la partie"),
            content: Text("Voulez-vous abandonner la partie?"),
            actions: <TextButton>[
              TextButton(
                onPressed: () {
                  print("abandonning game");
                  getIt<SocketService>().send('abandon-game');
                  Navigator.pop(context);
                  Navigator.push(context, MaterialPageRoute(builder: (context) {
                    return GameModes();
                  }));
                },
                child: const Text('Oui'),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                child: const Text('Non'),
              ),
            ],
          );
        });
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
    getIt<SocketService>().on('end-game', (_) {
      setState(() {
        commandSent = true;
        isEndGame = true;
      });
    });
    int index;
    int column;
    int line;
    getIt<SocketService>().on('draw-letters-opponent', (letters) {
      setState(() {
        index = opponentTileID[0];
        for (var letter in letters) {
          isTileLocked[index] = true;
          tileLetter[index] = letter["value"].toString();
          line = int.parse(letter["line"].toString());
          column = int.parse(letter["column"].toString());
          tilePosition[index] =
              getIt<TilePlacement>().getOpponentPosition(line, column);
          index += 1;
        }
        updateRackID(true, opponentTileID);
      });
      board.isFilledForEachLetter(board.createOpponentLetters(letters));
      if (!widget.isClassicMode)
        getIt<SocketService>().send('draw-letters-rack');
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
        setState(() {
          commandSent = false;
          setTileOnRack();
        });
      } else {
        if (widget.isClassicMode) {
          setState(() {
            commandSent = true;
          });
          getIt<SocketService>().send('remove-letters-rack-light-client',
              jsonEncode(placedWord["letters"]));
          getIt<SocketService>().send('validate-created-words', placedWord);
        } else {
          sendVoteAction("place", placedWord, null);
        }
      }
    });

    getIt<SocketService>().on('validate-created-words', (placedWord) async {
      if (widget.isClassicMode) getIt<SocketService>().send('freeze-timer');
      if (placedWord["points"] != 0) {
        musicService.playMusic(GOOD_PLACEMENT_SOUND,false);
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
        if (!widget.isClassicMode)
          getIt<SocketService>().send('cooperative-invalid-action', true);
        musicService.playMusic(BAD_PLACEMENT_SOUND,false);
        setTileOnRack();
        changeTurn();
      }
      setState(() {
        commandSent = false;
      });
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
        if (!widget.isClassicMode)
          getIt<SocketService>().send('cooperative-invalid-action', false);
      } else {
        if (widget.isClassicMode)
          getIt<SocketService>().send('exchange-opponent-message',
              command["name"].split(' ')[1].length);
        switchRack(true);
      }
    });
    getIt<SocketService>().on('user-turn', (playerTurnId) {
      setState(() {
        // On remet les lettres quil a placé dans le board qd le timer est écoulé
        setTileOnRack();
        if (widget.isClassicMode)
          isPlayerTurn = playerTurnId == getIt<SocketService>().socketId;
        else
          isPlayerTurn = true;
      });
    });
    getIt<SocketService>().on('vote-action', (voteAction) {
      openVoteActionDialog(context, CooperativeAction.fromJson(voteAction));
    });
    getIt<SocketService>().on('cooperative-invalid-action', (isPlacement) {
      final message = isPlacement
          ? 'Erreur : les mots crées sont invalides'
          : 'Commande impossible a réaliser : le nombre de lettres dans la réserve est insuffisant';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            backgroundColor: Colors.blue,
            duration: Duration(seconds: 2),
            content: Text(message)),
      );
    });
    getIt<SocketService>().on('player-action', (message) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            backgroundColor: Colors.blue,
            duration: Duration(seconds: 2),
            content: Text(message)),
      );
    });

    getIt<SocketService>().on("get-theme-language", (value) {
      langOrTheme = value;
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
                  if (isTileLocked[id] != true &&
                      isPlayerTurn &&
                      !commandSent) {
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

  void sendVoteAction(
      String action, dynamic placedWord, dynamic lettersToExchange) {
    final choiceMap = {getIt<SocketService>().socketId: 'yes'};
    final voteAction = CooperativeAction(
        action: action,
        socketId: getIt<SocketService>().socketId,
        votesFor: 1,
        votesAgainst: 0,
        socketAndChoice: choiceMap,
        placement: placedWord,
        lettersToExchange: action == "exchange" ? lettersToExchange : '');
    getIt<SocketService>().send('vote-action', voteAction);
  }

  void passTurn() {
    if (widget.isClassicMode) {
      getIt<SocketService>().send('pass-turn');
      setState(() {
        switchRack(true);
      });
      musicService.playMusic(SWITCH_TURN_SOUND,false);
    } else {
      sendVoteAction("pass", null, null);
    }
  }

  void exchangeCommand(String lettersToExchange) {
    if (widget.isClassicMode) {
      getIt<SocketService>().send('exchange-command', lettersToExchange);
      musicService.playMusic(CHANGE_TILE_SOUND,false);
    } else {
      sendVoteAction("exchange", null, lettersToExchange);
    }
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
                  isEndGame ? leaveGame() : openAbandonDialog(context);
                  musicService.playMusic(LOSE_GAME_SOUND,false);
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
            Positioned(
                left: 0,
                top: 10,
                child: TimerPage(
                  isClassicMode: widget.isClassicMode,
                )),
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
                onPressed: !isPlayerTurn || commandSent
                    ? null
                    : () {
                        passTurn();
                      },
                backgroundColor: !isPlayerTurn || commandSent
                    ? Colors.grey
                    : Color.fromARGB(255, 253, 174, 101),
                child: Icon(
                  Icons.double_arrow_rounded,
                  color: !isPlayerTurn || commandSent
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
                onPressed: !isPlayerTurn || commandSent
                    ? null
                    : () {
                        if (lettersofBoard.isNotEmpty) {
                          setState(() {
                            validatePlacement();
                          });
                        }
                      },
                backgroundColor: !isPlayerTurn || commandSent
                    ? Colors.grey[200]
                    : Color.fromARGB(255, 159, 201, 165),
                child: Icon(
                  Icons.check_box,
                  color: !isPlayerTurn || commandSent
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
                onPressed: !isPlayerTurn || commandSent
                    ? null
                    : () {
                        showDialog<String>(
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
                            }).then((String? lettersToExchange) {
                          if (lettersToExchange != "") {
                            exchangeCommand(lettersToExchange!);
                          }
                        });
                      },
                backgroundColor: !isPlayerTurn || commandSent
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

  void openVoteActionDialog(BuildContext context, CooperativeAction action) {
    showDialog(
        context: context,
        barrierDismissible: false,
        barrierColor: Colors.transparent,
        builder: (BuildContext context) {
          return Stack(
            children: [
              Positioned(
                  top: 2.0,
                  child: AlertDialog(
                      shape: RoundedRectangleBorder(
                          side: BorderSide(color: Colors.yellow, width: 5)),
                      content: CooperativeActionWidget(actionParam: action))),
            ],
          );
        }).then((result) {
      if (result["action"].socketId == getIt<SocketService>().socketId &&
          result["isAccepted"]) {
        if (result["action"].action == 'place') {
          commandSent = true;
          getIt<SocketService>().send('remove-letters-rack-light-client',
              jsonEncode(result["action"].placement["letters"]));
          getIt<SocketService>()
              .send('validate-created-words', result["action"].placement);
        } else if (result["action"].action == 'pass') {
          getIt<SocketService>().send('pass-turn');
        } else if (result["action"].action == 'exchange') {
          getIt<SocketService>()
              .send('exchange-command', result["action"].lettersToExchange);
        }
      } else if (result["action"].socketId == getIt<SocketService>().socketId &&
              !result["isAccepted"] ||
          result["action"].socketId != getIt<SocketService>().socketId) {
        setState(() {
          commandSent = false;
          setTileOnRack();
          // On remet lettersOfBoard a une liste vide car ses lettres sont replacés
          lettersofBoard = [];
        });
      }
      final message =
          result["isAccepted"] ? 'Action accepted' : 'Action refused';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            backgroundColor: Colors.blue,
            duration: Duration(seconds: 3),
            content: Text(message)),
      );
    });
  }
}
