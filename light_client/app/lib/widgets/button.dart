import 'package:flutter/material.dart';

class GameButton extends StatelessWidget {
  final String name;
  final void Function() route;
  const GameButton({required this.name, required this.route});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32.0),
      child: MaterialButton(
        height: 40,
        onPressed: this.route,
        color: Colors.blue,
        textColor: Colors.white,
        child: Text(this.name),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4.0),
        ),
        padding: EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
      ),
    );
  }
}
