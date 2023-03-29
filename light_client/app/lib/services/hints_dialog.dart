import 'package:flutter/material.dart';

import '../models/Words_Args.dart';

class HintDialog extends StatelessWidget {
  final List<WordArgs> items;
  final Function(WordArgs)? onNoClick;

  HintDialog({required this.items, this.onNoClick});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text("Liste d'indices"),
      content: Flexible(
        child: SizedBox(
          width: double.maxFinite,
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: items.length,
            itemBuilder: (BuildContext context, int index) {
              return GestureDetector(
                onTap: () {
                  if (onNoClick != null) {
                    onNoClick!(items[index]);
                  }
                  Navigator.pop(context);
                },
                child: Card(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        items[index].value!,
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                          "Position: ${items[index].line},${items[index].column}"),
                      Text("Orientation: ${items[index].orientation}"),
                      Text("Points: ${items[index].points}"),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () {
            if (onNoClick != null) {
              // Navigator.pop(context);
              // onNoClick!();
            }
            Navigator.pop(context);
          },
          child: Text('Close'),
        ),
      ],
    );
  }
}