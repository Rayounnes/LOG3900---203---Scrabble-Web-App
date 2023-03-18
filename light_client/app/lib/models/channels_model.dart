import 'package:app/models/chat_message_model.dart';

class Channels {
  String name;
  bool isGameChannel;
  List<String> users;
  List<ChatMessage> messages;
  Channels(
      {required this.name,
      required this.isGameChannel,
      required this.users,
      required this.messages});

  factory Channels.fromJson(Map<String, dynamic> json) {
    return Channels(
      name: json['name'],
      isGameChannel: json['isGameChannel'],
      users: json['users'],
      messages: json['messages'],
    );
  }

  Map toJson() => {
        'name': name,
        'isGameChannel': isGameChannel,
        'users': users,
        'messages': messages,
      };
}