class ChatMessage {
  String username;
  String message;
  String time;
  String type;
  ChatMessage(
      {required this.username,
      required this.message,
      required this.time,
      required this.type});

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      username: json['username'],
      message: json['message'],
      time: json['time'],
      type: json['type'],
    );
  }

  Map toJson() => {
        'username': username,
        'time': time,
        'message': message,
        'type': type,
      };
}
