import 'package:app/models/game.dart';
import 'package:app/widgets/button.dart';
import 'package:flutter/material.dart';

class GameInfo extends StatefulWidget {
  Game game;
  final void Function() joinGame;
  GameInfo({required this.game, required this.joinGame});
  @override
  _GameInfoState createState() => _GameInfoState();
}

class _GameInfoState extends State<GameInfo> {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.blue[200],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            Icon(Icons.gamepad_rounded),
            Text(
              "Joeur hôte: ${widget.game.usernameOne}\n",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            Text(
              "Temps par tour (s): ${widget.game.time}\n",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            Text(
              "Dictionnaire: ${widget.game.dictionary.title}\n",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            GameButton(
              name: "Rejoindre partie",
              route: widget.joinGame,
              padding: 8.0,
            )
          ],
        ),
      ),
    );
  }
}
