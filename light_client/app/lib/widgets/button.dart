import 'package:flutter/material.dart';

class GameButton extends StatelessWidget {
  final String name;
  final void Function() route;
  final bool isButtonDisabled;
  final double padding;
  final theme = "light";
  const GameButton(
      {required this.name,
      required this.route,
      required this.padding,
      this.isButtonDisabled = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(padding),
      child: MaterialButton(
        height: 40,
        onPressed: isButtonDisabled ? null : route,
        color: theme == "dark"
            ? Colors.green[800]
            : Color.fromARGB(255, 160, 235, 160),
        textColor: theme == "dark" ? Colors.white : Colors.black,
        child: Text(this.name),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4.0),
        ),
        padding: EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
      ),
    );
  }
}
