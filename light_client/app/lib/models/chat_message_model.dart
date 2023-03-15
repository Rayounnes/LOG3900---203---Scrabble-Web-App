class ChatMessage {
  String username;
  String message;
  String time;
  String type;
  String? channel;
  
  ChatMessage(
      {required this.username,
      required this.message,
      required this.time,
      required this.type,
      this.channel});

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      username: json['username'],
      message: json['message'],
      time: json['time'],
      type: json['type'],
      channel: json['channel']
    );
  }

  Map toJson() => {
        'username': username,
        'time': time,
        'message': message,
        'type': type,
        'channel': channel
      };
}
