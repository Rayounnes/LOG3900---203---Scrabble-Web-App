import 'dart:convert';
import 'package:app/services/translate_service.dart';
import 'package:app/models/Words_Args.dart';
import 'package:flutter/material.dart';

import 'package:app/main.dart';
import 'package:app/models/cooperative_action.dart';
import 'package:app/screens/game_modes_page.dart';
import 'package:app/screens/tile_exchange_menu.dart';
import 'package:app/services/music_service.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/widgets/cooperative_action.dart';
import 'package:app/widgets/information_pannel.dart';
import 'package:app/widgets/parent_widget.dart';
import 'package:app/widgets/tile.dart';
import '../constants/letters_points.dart';
import '../constants/widgets.dart';
import '../models/personnalisation.dart';
import '../services/tile_placement.dart';
import '../models/letter.dart';
import '../models/board_paint.dart';
import '../models/placement.dart';
import '../services/hints_dialog.dart';
import '../services/board.dart';

// Copyright 2019 The Flutter team. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be

class GamePage extends StatefulWidget {
  final bool isClassicMode, isObserver;
  final Function joinGameSocket;
  const GamePage(
      {super.key,
      required this.isClassicMode,
      required this.isObserver,
      required this.joinGameSocket});

  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> {
  final Map<int, Offset> tilePosition = {};
  final Map<int, String> tileLetter = {};
  final Map<int, String> hintLetters = {};

  final Map<int, bool> isTileLocked = {};
  final board = new Board();
  List<int> rackIDList = List.from(PLAYER_INITIAL_ID);
  List<dynamic> tempHintRack = [];
  List<int> opponentTileID = List.from(OPPONENT_INITIAL_ID);
  List<Letter> lettersofBoard = [];
  List<Letter> lettersOpponent = [];
  bool isPlayerTurn = false;
  bool commandSent = false;
  bool isEndGame = false;
  final List<String> letters =
      List.generate(26, (index) => String.fromCharCode(index + 65));
  String selectedLetter = '';
  late Personnalisation langOrTheme;
  String lang = "en";
  TranslateService translate = new TranslateService();

  List<Placement> hints = [];
  List<WordArgs> formatedHints = [];
  @override
  void initState() {
    print("-------------------------Initiation game-page-------------------");
    super.initState();
    handleSockets();
    widget.joinGameSocket();
    if (!widget.isObserver) {
      getRack();
      setTileOnRack();
      selectedLetter = '';
      if (!widget.isClassicMode) isPlayerTurn = true;
    }
  }

  @override
  void dispose() {
    print("dispose game page called");
    getIt<SocketService>().userSocket.off('end-game');
    getIt<SocketService>().userSocket.off('draw-letters-opponent');
    getIt<SocketService>().userSocket.off('draw-letters-rack');
    getIt<SocketService>().userSocket.off('verify-place-message');
    getIt<SocketService>().userSocket.off('validate-created-words');
    getIt<SocketService>().userSocket.off('exchange-command');
    getIt<SocketService>().userSocket.off('user-turn');
    getIt<SocketService>().userSocket.off('hint-cooperative');
    getIt<SocketService>().userSocket.off('vote-action');
    getIt<SocketService>().userSocket.off('cooperative-invalid-action');
    getIt<SocketService>().userSocket.off('player-action');
    getIt<SocketService>().userSocket.off('game-won');
    getIt<SocketService>().userSocket.off('game-loss');
    getIt<SocketService>().userSocket.off("update-points-mean");
    getIt<SocketService>().userSocket.off('hint-command');
    getIt<SocketService>().userSocket.off('get-configs');
    super.dispose();
  }

  void leaveGame() {
    getIt<SocketService>().send('quit-game');
    Navigator.pop(context);
    Navigator.push(context, MaterialPageRoute(builder: (context) {
      return GameModes();
    }));
  }

  void leaveObservation() {
    getIt<SocketService>().send('observer-left');
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
            title:
                Text(translate.translateString(lang, "Abandonner la partie")),
            content: Text(translate.translateString(
                lang, "Voulez-vous abandonner la partie?")),
            actions: <TextButton>[
              TextButton(
                onPressed: () {
                  print("abandonning game");
                  getIt<SocketService>().send('abandon-game');
                  Navigator.pop(context); // pop le dialog
                  Navigator.pop(context); // pop le game page
                  Navigator.push(context, MaterialPageRoute(builder: (context) {
                    return GameModes();
                  }));
                },
                child: Text(translate.translateString(lang, 'Oui')),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                child: Text(translate.translateString(lang, 'Non')),
              ),
            ],
          );
        });
  }

  void _showLetterPicker(int line, int column, int tileId) {
    showDialog(
      context: context,
      barrierDismissible: false,
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
      formatedHints.add(WordArgs(
        line: lineWord,
        column: columnWord,
        value: valueWord,
        orientation: orientationWord,
        points: hint["points"],
      ));
    }
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
        if (letterValue != null) {
          tileLetter[tileID] =
              letterValue!.toUpperCase() == letterValue ? '*' : letterValue;
        }
        return;
      }
    }
  }

  validationHintWord(WordArgs word) {
    if (lettersofBoard != null) {
      setTileOnRack();
    }
    placeWordHint(word);
    validatePlacement();
  }

  placeWordHint(WordArgs word) {
    int firstX = word.column!;
    int firstY = word.line!;
    for (String letter in word.value!.split('')) {
      int tileID = getTileID(letter);
      if (word.orientation == 'h') {
        while (board.getIsFilled(firstY, firstX)) {
          firstX++;
        }
        setTileOnBoard(
            Offset(firstX.toDouble(), firstY.toDouble()), tileID, true, letter);
        tilePosition[tileID] = Offset(LEFT_BOARD_POSITION + firstX * 50,
            TOP_BOARD_POSITION + firstY * 50);

        firstX++;
      }
      if (word.orientation == 'v') {
        while (board.getIsFilled(firstY, firstX)) {
          firstY++;
        }
        setTileOnBoard(
            Offset(firstX.toDouble(), firstY.toDouble()), tileID, true, letter);
        tilePosition[tileID] = Offset(LEFT_BOARD_POSITION + firstX * 50,
            TOP_BOARD_POSITION + firstY * 50);

        firstY++;
      }
    }
  }

  int getTileID(String letter) {
    int? targetID;
    // on a un rack avec les lettres et une liste avec les ids
    if (letter == letter.toUpperCase()) {
      letter = '*';
    }
    int indexInRack = tempHintRack.indexOf(letter);

    targetID = rackIDList[indexInRack];
    tempHintRack[indexInRack] = " ";
    return targetID;

    //   for (int key in hintLetters.keys) {
    //     if (letter == letter.toUpperCase()) {
    //       letter = '*';
    //     }
    //     if (hintLetters[key] == letter) {
    //       targetKey = key;
    //       hintLetters[key] = " ";
    //       return targetKey;
    //     }
    //   }
    //   return targetKey!;
  }

  Offset setTileOnBoard(Offset offset, int tileID, bool isHint,
      [String? letter]) {
    Offset positionOnBoard =
        getIt<TilePlacement>().getTilePosition(offset, tileID);
    int line = 0;
    int column = 0;
    if (isHint) {
      line = offset.dy.toInt();
      column = offset.dx.toInt();
    } else {
      line = ((positionOnBoard.dy - TOP_BOARD_POSITION) ~/ TILE_SIZE);
      column = positionOnBoard.dx ~/ TILE_SIZE;
    }

    String? letterValue = tileLetter[tileID];
    selectedLetter = '';

    if (board.verifyRangeBoard(line, column)) {
      if (verifyLetterOnBoard(tileID)) {
        removeLetterOnBoard(tileID);
      }
      if (letterValue == '*') {
        _showLetterPicker(line, column, tileID);
      } else {
        if (isHint) {
          if (letter == letter!.toUpperCase()) {
            lettersofBoard
                .add(Letter(line, column, letter!.toUpperCase(), tileID));
            tileLetter[tileID] = letter;
          } else {
            lettersofBoard
                .add(Letter(line, column, letter!.toLowerCase(), tileID));
          }
        } else {
          lettersofBoard
              .add(Letter(line, column, letterValue!.toLowerCase(), tileID));
        }
      }
    } else {
      removeLetterOnBoard(tileID);
    }

    return getIt<TilePlacement>().setTileOnBoard(offset, tileID, isHint);
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
        if (tileLetter[index] != null &&
            tileLetter[index] != '' &&
            tileLetter[index]?.toUpperCase() == tileLetter[index]) {
          tileLetter[index] = '*';
        }
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

  // numLetters car qd ya un observateur, on redessine tout le board les lettres sont > que RACK_SIZE
  void updateRackID(bool isForExchange, List<int> tileIDList, int numLetters) {
    setState(() {
      int addToTileId = numLetters > RACK_SIZE
          ? RACK_SIZE * (numLetters / RACK_SIZE).ceil()
          : RACK_SIZE;
      for (int i = 0; i < tileIDList.length; i++) {
        tileIDList[i] += addToTileId;
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

    //Comptez les wins et les points
    getIt<SocketService>().on('game-won', (_) {
      print('partie gagnée');
      getIt<SocketService>().send('game-won');
      getIt<SocketService>().send('game-history-update', true);
    });
    getIt<SocketService>().on('game-loss', (_) {
      getIt<SocketService>().send('game-history-update', false);
    });
    getIt<SocketService>().on("update-points-mean", (points) {
      getIt<SocketService>().send("update-points-mean", points);
    });

    getIt<SocketService>().on('end-game', (_) {
      // Envoyer dans endgame si il a gagné ou perdu
      getIt<MusicService>().playMusic(LOSE_GAME_SOUND, false);
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
        updateRackID(true, opponentTileID, letters.length);
      });
      board.isFilledForEachLetter(board.createOpponentLetters(letters));
      if (!widget.isClassicMode && !widget.isObserver)
        getIt<SocketService>().send('draw-letters-rack');
    });

    getIt<SocketService>().on('draw-letters-rack', (letters) {
      if (!widget.isObserver) {
        if (!mounted) return;
        setState(() {
          for (var index in rackIDList) {
            tileLetter[index] = letters[index % RACK_SIZE].toString();
          }
          tempHintRack = letters;
        });
      }
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
        getIt<MusicService>().playMusic(GOOD_PLACEMENT_SOUND, false);
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
              content: Text(translate.translateString(
                  lang, 'Erreur : les mots crées sont invalides'))),
        );
        if (!widget.isClassicMode)
          getIt<SocketService>().send('cooperative-invalid-action', true);
        getIt<MusicService>().playMusic(BAD_PLACEMENT_SOUND, false);
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
      if (!widget.isObserver) getIt<SocketService>().send('hint-command');
    });

    getIt<SocketService>().on('hint-cooperative', (_) {
      if (!widget.isObserver) getIt<SocketService>().send('hint-command');
    });

    getIt<SocketService>().on('hint-command', (placements) {
      setState(() {
        createWord(placements);
      });
    });
    getIt<SocketService>().on('vote-action', (voteAction) {
      openVoteActionDialog(context, CooperativeAction.fromJson(voteAction));
    });
    getIt<SocketService>().on('cooperative-invalid-action', (isPlacement) {
      final message = isPlacement
          ? translate.translateString(
              lang, 'Erreur : les mots crées sont invalides')
          : translate.translateString(lang,
              'Commande impossible a réaliser : le nombre de lettres dans la réserve est insuffisant');
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

    getIt<SocketService>().on('get-configs', (value) {
      langOrTheme = value;
    });
  }

  void switchRack(bool isForExchange) {
    lockTileOnBoard(isForExchange);
    updateRackID(isForExchange, rackIDList, RACK_SIZE);
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
        if (tileLetter[id] != null && tileLetter[id] != '') {
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
                    Offset boardPosition = setTileOnBoard(offset, id, false);

                    if (!tilePosition.containsValue(boardPosition)) {
                      tilePosition[id] = boardPosition;
                    }
                    getIt<MusicService>()
                        .playMusic(GOOD_PLACEMENT_SOUND, false);
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
      getIt<MusicService>().playMusic(SWITCH_TURN_SOUND, false);
    } else {
      sendVoteAction("pass", null, null);
    }
  }

  void exchangeCommand(String lettersToExchange) {
    if (widget.isClassicMode) {
      getIt<SocketService>().send('exchange-command', lettersToExchange);
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
            title: Text(
              translate.translateString(lang, 'Page de jeu'),
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            actions: [
              FloatingActionButton(
                heroTag: "btn1",
                onPressed: () {
                  if (widget.isObserver) {
                    leaveObservation();
                  } else {
                    isEndGame ? leaveGame() : openAbandonDialog(context);
                  }
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
                  isObserver: widget.isObserver,
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
                    painter: BoardPaint(widget.isObserver),
                    size: Size(750, 750),
                  ),
                ),
              ),
            ),
            ...fillRack(),
            if (!widget.isObserver) ...[
              Positioned(
                left: LEFT_BOARD_POSITION,
                top: RACK_START_AXISY - 30,
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
                            print("placingggggg");
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
                top: RACK_START_AXISY - 30,
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
              ),
              Positioned(
                left: LEFT_BOARD_POSITION + TILE_ADJUSTMENT / 2,
                top: RACK_START_AXISY + 38,
                child: FloatingActionButton(
                  heroTag: "hintLetters",
                  onPressed: !isPlayerTurn || commandSent
                      ? null
                      : () {
                          HintDialog hintDialog = HintDialog(
                            items: formatedHints,
                            onNoClick: (word) {
                              validationHintWord(word);
                            },
                          );

                          showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return hintDialog;
                            },
                          );
                        },
                  backgroundColor: !isPlayerTurn || commandSent
                      ? Colors.grey
                      : Color.fromARGB(255, 55, 151, 189),
                  child: Icon(
                    Icons.star_rounded,
                    color: Color.fromARGB(255, 255, 255, 255),
                    size: TILE_SIZE,
                  ),
                ),
              ),
            ]
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
                      content: CooperativeActionWidget(
                          actionParam: action, isObserver: widget.isObserver))),
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
        if (!widget.isObserver) {
          setState(() {
            commandSent = false;
            setTileOnRack();
            // On remet lettersOfBoard a une liste vide car ses lettres sont replacés
            lettersofBoard = [];
          });
        }
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
