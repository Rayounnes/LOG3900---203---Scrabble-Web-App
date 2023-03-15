import 'package:app/models/dictionnary_model.dart';
import 'package:app/models/player_infos.dart';
import 'dart:convert';
import '../constants/constants.dart';

class Game {
  bool isClassicMode, isPrivate, hasStarted, isFullPlayers;
  int playersWaiting, humanPlayers, observers, virtualPlayers, time;
  String hostUsername, hostID, room, password;
  List<PlayerInfos> joinedPlayers, joinedObservers;
  Dictionary dictionary;

  Game({
    required this.hostUsername,
    required this.time,
    this.dictionary = FRENCH_DICTIONNARY,
    this.hostID = '',
    this.room = '',
    this.password = '',
    this.joinedObservers = const [],
    this.joinedPlayers = const [],
    this.hasStarted = false,
    this.humanPlayers = 2,
    this.isClassicMode = false,
    this.isPrivate = false,
    this.observers = 0,
    this.playersWaiting = 0,
    this.virtualPlayers = 0,
    this.isFullPlayers = false,
  });

  factory Game.fromJson(Map<String, dynamic> json) {
    return Game(
      hostUsername: json['hostUsername'],
      password: json['password'],
      joinedObservers: List<PlayerInfos>.from(json['joinedObservers']
          .map((observer) => PlayerInfos.fromJson(observer))
          .toList()),
      joinedPlayers: List<PlayerInfos>.from(json['joinedPlayers']
          .map((player) => PlayerInfos.fromJson(player))
          .toList()),
      hasStarted: json['hasStarted'],
      humanPlayers: json['humanPlayers'],
      isClassicMode: json['isClassicMode'],
      isPrivate: json['isPrivate'],
      observers: json['observers'],
      playersWaiting: json['playersWaiting'],
      virtualPlayers: json['virtualPlayers'],
      isFullPlayers: json['isFullPlayers'],
      hostID: json['hostID'],
      time: json['time'],
      room: json['room'],
      dictionary: Dictionary.fromJson(json['dictionary']),
    );
  }

  // avoir une methode toJson pour chaque classe qui va etre send dans une socket
  Map toJson() => {
        'hostUsername': hostUsername,
        'password': password,
        'joinedObservers': json.encode(
            joinedObservers.map((observer) => observer.toJson()).toList()),
        'joinedPlayers': json
            .encode(joinedPlayers.map((player) => player.toJson()).toList()),
        'hasStarted': hasStarted,
        'humanPlayers': humanPlayers,
        'isClassicMode': isClassicMode,
        'isPrivate': isPrivate,
        'observers': observers,
        'playersWaiting': playersWaiting,
        'virtualPlayers': virtualPlayers,
        'isFullPlayers': isFullPlayers,
        'hostID': hostID,
        'time': time,
        'room': room,
        'dictionary': dictionary.toJson(),
      };
}
