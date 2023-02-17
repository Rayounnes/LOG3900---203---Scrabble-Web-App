import 'package:app/models/dictionnary_model.dart';

class Game {
  bool isJoined;
  String usernameOne, usernameTwo, hostID, mode, type;
  int time;
  Dictionary dictionnary;
  Game(
      {required this.usernameOne,
      required this.time,
      required this.mode,
      required this.type,
      required this.dictionnary,
      this.isJoined = false,
      this.usernameTwo = '',
      this.hostID = ''});

  // avoir une methode toJson pour chaque classe qui va etre send dans une socket
  Map toJson() => {
        'usernameOne': usernameOne,
        'usernameTwo': usernameTwo,
        'hostID': hostID,
        'mode': mode,
        'type': type,
        'time': time,
        'dictionnary': dictionnary.toJson(),
      };
}
