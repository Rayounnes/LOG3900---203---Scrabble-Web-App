import 'package:app/models/dictionnary_model.dart';

class Game {
  bool isJoined;
  String usernameOne, usernameTwo, hostID, mode, type, room;
  int time;
  Dictionary dictionary;
  Game({
    required this.usernameOne,
    required this.time,
    required this.mode,
    required this.type,
    required this.dictionary,
    this.isJoined = false,
    this.usernameTwo = '',
    this.hostID = '',
    this.room = '',
  });

  factory Game.fromJson(Map<String, dynamic> json) {
    return Game(
      isJoined: json['isJoined'] == null ? false : json['isJoined'],
      usernameOne: json['usernameOne'],
      usernameTwo: json['usernameTwo'] == null ? '' : json['usernameTwo'],
      hostID: json['hostID'],
      mode: json['mode'],
      type: json['type'],
      time: json['time'],
      room: json['room'],
      dictionary: Dictionary.fromJson(json['dictionary']),
    );
  }

  // avoir une methode toJson pour chaque classe qui va etre send dans une socket
  Map toJson() => {
        'usernameOne': usernameOne,
        'usernameTwo': usernameTwo,
        'hostID': hostID,
        'mode': mode,
        'type': type,
        'time': time,
        'room': room,
        'dictionary': dictionary.toJson(),
      };
}
