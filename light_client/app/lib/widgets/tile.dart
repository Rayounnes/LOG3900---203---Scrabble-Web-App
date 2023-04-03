import 'package:flutter/material.dart';

import '../constants/letters_points.dart';
import '../constants/widgets.dart';

class TileWidget extends StatelessWidget {
  final String letter;
  final String points;
  final double tileSize;
  const TileWidget(
      {required this.letter, required this.points, this.tileSize = TILE_SIZE});
  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
        decoration: BoxDecoration(
          color: Color.fromARGB(255, 249, 224, 118),
          borderRadius: BorderRadius.circular(5),
          border: Border.all(
            color: Colors.black,
            width: 0.5,
          ),
        ),
        duration: Duration(seconds: 1),
        height: tileSize,
        width: tileSize,
        child: Stack(
          children: [
            Align(
              alignment: Alignment.center,
              child: Padding(
                padding: EdgeInsets.all(4),
                child: Text(
                  letter.toUpperCase(),
                  style: TextStyle(
                    fontSize: tileSize == TILE_SIZE ? 24 : 15,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
              ),
            ),
            Align(
              alignment: Alignment.bottomRight,
              child: Padding(
                padding: EdgeInsets.all(4),
                child: Text(
                  points,
                  style: TextStyle(
                    fontSize: tileSize == TILE_SIZE ? 11 : 8,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
              ),
            ),
          ],
        ));
  }
}
