import 'package:flutter/material.dart';

class WordArgs {
  int? line;
  int? column;
  String? orientation;
  String? value;

  WordArgs({this.line, this.column, this.orientation, this.value});

  factory WordArgs.fromJson(Map<String, dynamic> json) {
    return WordArgs(
      line: json['line'],
      column: json['column'],
      orientation: json['orientation'],
      value: json['value'],
    );
  }

  Map toJson() => {
        'line': line,
        'column': column,
        'orientation': orientation,
        'value': value,
      };
}