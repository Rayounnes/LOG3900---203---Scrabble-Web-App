import 'package:flutter/material.dart';

class Tile {
  int tileID;
  String letter;
  Offset? position;
  bool? isFilled;
  bool? isStart;
  String? direction;
  Tile(
      {required this.tileID,
      required this.letter,
      this.position,
      this.isFilled,
      this.isStart,
      this.direction});

  factory Tile.fromJson(Map<String, dynamic> json) {
    return Tile(
      tileID: json['tileID'],
      letter: json['letter'],
      position: json['position'],
      isFilled: json['isFilled'],
      isStart: json['isStart'],
      direction: json['direction'],
    );
  }

  Map toJson() => {
        'tileID': tileID,
        'letter': letter,
        'position': position,
        'isFilled': isFilled,
        'isStart': isStart,
        'direction': direction,
      };
}
