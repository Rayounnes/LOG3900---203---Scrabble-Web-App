import 'dart:async';
import 'dart:convert';
import 'package:app/models/cooperative_action.dart';
import 'package:flutter/material.dart';
import 'package:app/services/socket_client.dart';
import 'package:app/main.dart';

import '../services/translate_service.dart';

const DEFAULT_CLOCK = 60;
const ONE_SECOND = 1000;

class CooperativeActionWidget extends StatefulWidget {
  final CooperativeAction actionParam;
  final bool isObserver;
  final String lang;
  const CooperativeActionWidget(
      {super.key,
      required this.actionParam,
      required this.isObserver,
      required this.lang});

  @override
  _CooperativeActionWidgetState createState() =>
      _CooperativeActionWidgetState();
}

class _CooperativeActionWidgetState extends State<CooperativeActionWidget> {
  late CooperativeAction action;
  dynamic usernameAndAvatars = {}; // { socketId : [username,avatar]}
  bool infoget = false;
  bool choiceMade = false;
  int gameDuration = 0;
  Map<String, MemoryImage> icons = new Map<String, MemoryImage>();
  TranslateService translate = new TranslateService();

  ///socketId - image
  int _start = DEFAULT_CLOCK;
  int timerDuration = DEFAULT_CLOCK;
  late Timer _timer;

  void startTimer() {
    const oneSec = Duration(seconds: 1);
    _timer = Timer.periodic(
      oneSec,
      (Timer timer) => setState(
        () {
          _start -= 1;
          if (_start == 0) {
            timer.cancel();
            if (!choiceMade && !widget.isObserver) sendVote(false);
          }
        },
      ),
    );
  }

  void clearInterval() {
    _timer.cancel();
    _start = timerDuration;
  }

  void sendVote(bool isAccepted) {
    setState(() {
      choiceMade = true;
    });
    getIt<SocketService>().send('player-vote', isAccepted);
  }

  void setCreator() {
    if (action.socketAndChoice[getIt<SocketService>().socketId] == "yes") {
      setState(() {
        choiceMade = true;
      });
    }
  }

  void handleSockets() {
    print("handle sockets coop pannel");
    getIt<SocketService>().on('update-vote-action', (jsonAction) {
      setState(() {
        action = CooperativeAction.fromJson(jsonAction);
      });
    });
    getIt<SocketService>().on('accept-action', (jsonAction) {
      setState(() {
        action = CooperativeAction.fromJson(jsonAction);
        Navigator.pop(context, {'action': action, 'isAccepted': true});
      });
    });
    getIt<SocketService>().on('reject-action', (jsonAction) {
      setState(() {
        action = CooperativeAction.fromJson(jsonAction);
        Navigator.pop(context, {'action': action, 'isAccepted': false});
      });
    });
    getIt<SocketService>().on('choice-pannel-info', (userAvatars) {
      Map<String, dynamic> mapUsernamesAvatars =
          userAvatars as Map<String, dynamic>;
      for (var socketPlayer in mapUsernamesAvatars.keys.toList()) {
        icons[socketPlayer] = MemoryImage(
            base64Decode(mapUsernamesAvatars[socketPlayer][1].split(',')[1]));
      }
      setState(() {
        usernameAndAvatars = mapUsernamesAvatars;
        infoget = true;
      });
    });
  }

  @override
  void initState() {
    super.initState();
    setState(() {
      action = widget.actionParam;
    });
    getIt<SocketService>().send('choice-pannel-info',
        json.encode(action.socketAndChoice.keys.toList()));
    setCreator();
    handleSockets();
    _timer = Timer(Duration(milliseconds: 1), () {});
    startTimer();
  }

  @override
  void dispose() {
    print("dispose cooperative called");
    getIt<SocketService>().userSocket.off('update-vote-action');
    getIt<SocketService>().userSocket.off('accept-action');
    getIt<SocketService>().userSocket.off('reject-action');
    getIt<SocketService>().userSocket.off('choice-pannel-info');
    _timer.cancel();
    super.dispose();
  }

  Color getColor(double value) {
    if (value < 0.2) {
      return Colors.red;
    } else if (value < 0.3) {
      return Colors.orange;
    } else if (value < 0.5) {
      return Colors.yellow;
    } else {
      return Colors.green;
    }
  }

  @override
  Widget build(BuildContext context) {
    var socketChoices = action.socketAndChoice.keys.toList();
    return Column(
      children: [
        Container(
          width: 600,
          decoration: BoxDecoration(
            color: Colors.grey,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              width: 1,
              color: Colors.grey,
            ),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    translate.translateString(widget.lang, "Demande d'action"),
                    style: TextStyle(fontSize: 25, fontWeight: FontWeight.bold),
                  ),
                  timerWidget(context)
                ],
              ),
              if (action.placement != null)
                Text(
                  action.placement["command"],
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              if (action.action == 'exchange')
                Text(
                  translate.translateString(widget.lang, "Echanger les lettres") + "${action.lettersToExchange}",
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              if (action.action == 'pass')
                Text(
                  translate.translateString(widget.lang, "Passer le tour"),
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              for (int i = 0; i < socketChoices.length; i += 2)
                Row(
                  children: [
                    playerInfos(socketChoices[i]),
                    i + 1 < socketChoices.length
                        ? playerInfos(socketChoices[i + 1])
                        : Container(
                            width: 300,
                          ),
                  ],
                ),
            ],
          ),
        ),
        !choiceMade && !widget.isObserver
            ? Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  ElevatedButton(
                    onPressed: () {
                      sendVote(true);
                    },
                    child: Text(translate.translateString(widget.lang, "Accepter")),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      sendVote(false);
                    },
                    child: Text(translate.translateString(widget.lang, "Rejeter")),
                  ),
                ],
              )
            : Container(),
      ],
    );
  }

  Widget playerInfos(String playerSocket) {
    String socketAction = action.socketAndChoice[playerSocket];
    return infoget
        ? Expanded(
            child: Card(
              color: socketAction == 'choice'
                  ? Colors.grey[300]
                  : socketAction == 'yes'
                      ? Colors.green
                      : Colors.red,
              child: ListTile(
                leading: CircleAvatar(
                  radius: 25,
                  backgroundImage: icons[playerSocket],
                ),
                title: Text(usernameAndAvatars[playerSocket][0]),
                trailing: socketAction == 'choice'
                    ? CircularProgressIndicator()
                    : socketAction == 'yes'
                        ? Icon(Icons.check)
                        : Icon(Icons.close),
              ),
            ),
          )
        : Container();
  }

  Widget timerWidget(context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: SizedBox(
        width: 35.0,
        height: 35.0,
        child: Stack(
          children: [
            Positioned.fill(
              child: CircularProgressIndicator(
                strokeWidth: 5.0,
                value: _start / timerDuration, //entre 0.0 et 1
                backgroundColor: Colors.grey[200],
                valueColor: AlwaysStoppedAnimation<Color>(
                    getColor(_start / timerDuration)),
              ),
            ),
            Center(
              child: Text(
                '$_start',
                style: TextStyle(
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
