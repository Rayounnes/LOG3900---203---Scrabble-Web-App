import 'package:app/models/Letter.dart';

class Placement {
  List<Letter> letters;
  int points;
  String command;

  Placement({
    required this.letters,
    required this.points,
    required this.command,
  });
}