import 'package:app/models/placement.dart';

class CooperativeAction {
  String action;
  dynamic placement;
  String? lettersToExchange;
  String socketId;
  int votesFor;
  int votesAgainst;
  dynamic socketAndChoice;

  CooperativeAction({
    required this.action,
    this.placement,
    this.lettersToExchange,
    required this.socketId,
    required this.votesFor,
    required this.votesAgainst,
    required this.socketAndChoice,
  });

    factory CooperativeAction.fromJson(Map<String, dynamic> json) {
    return CooperativeAction(
      action: json['action'],
      placement: json['placement'],
      lettersToExchange: json['lettersToExchange'],
      socketId: json['socketId'],
      votesFor: json['votesFor'],
      votesAgainst: json['votesAgainst'],
      socketAndChoice: json['socketAndChoice'],
    );
  }
    Map toJson() => {
        'action': action,
        'placement': placement,
        'lettersToExchange': lettersToExchange,
        'socketId': socketId,
        'votesFor': votesFor,
        'votesAgainst': votesAgainst,
        'socketAndChoice': socketAndChoice,
      };
}