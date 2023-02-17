import 'package:app/screens/game_mode_choices.dart';
import 'package:app/widgets/button.dart';
import 'package:flutter/material.dart';

class GameModes extends StatefulWidget {
  const GameModes({super.key});

  @override
  State<GameModes> createState() => _GameModesState();
}

class _GameModesState extends State<GameModes> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.blueGrey,
      body: Center(
        child: Container(
          height: 500,
          width: 500,
          decoration: BoxDecoration(
            color: Colors.blue[200],
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              width: 1,
              color: Colors.grey,
            ),
          ),
          child: Column(
            children: <Widget>[
              Padding(
                padding: const EdgeInsets.only(top: 60.0),
                child: Text('Application Scrabble',
                    style: TextStyle(
                      fontSize: 23,
                      color: Colors.black,
                      fontWeight: FontWeight.w700,
                    )),
              ),
              SizedBox(height: 16.0),
              GameButton(
                  name: "Mode de jeu classique",
                  route: () {
                    Navigator.push(context,
                        MaterialPageRoute(builder: (context) {
                      return GameChoices();
                    }));
                  }),
              GameButton(
                  name: "Mode de jeu cooperatif",
                  route: () {
                    Navigator.push(context,
                        MaterialPageRoute(builder: (context) {
                      return GameChoices();
                    }));
                  }),
            ],
          ),
        ),
      ),
    );
  }
}