import 'package:flutter/material.dart';

class Tile {
  int? tileID;
  String letter;
  String? color;
  Offset? position;
  bool? isFilled;
  bool? isStart;
  String? direction;
  Tile(
      {this.tileID,
      required this.letter,
      this.color,
      this.position,
      this.isFilled,
      this.isStart,
      this.direction});

  factory Tile.fromJson(Map<String, dynamic> json) {
    return Tile(
      tileID: json['tileID'],
      letter: json['letter'],
      color: json['color'],
      position: json['position'],
      isFilled: json['isFilled'],
      isStart: json['isStart'],
      direction: json['direction'],
    );
  }

  Map toJson() => {
        'tileID': tileID,
        'letter': letter,
        'color': color,
        'position': position,
        'isFilled': isFilled,
        'isStart': isStart,
        'direction': direction,
      };
}
