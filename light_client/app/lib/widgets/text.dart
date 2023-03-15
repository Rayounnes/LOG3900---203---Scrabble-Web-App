import 'package:flutter/material.dart';

class TextPhrase extends StatelessWidget {
  final String text;
  const TextPhrase({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Text(text,
          style: TextStyle(
            fontSize: 23,
            color: Colors.black,
            fontWeight: FontWeight.w700,
          )),
    );
  }
}
