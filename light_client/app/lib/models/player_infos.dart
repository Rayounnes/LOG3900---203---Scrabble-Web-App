class PlayerInfos {
  final String username, socketId;
  const PlayerInfos({required this.username, required this.socketId});

  Map toJson() => {
        'username': username,
        'socketId': socketId,
      };

  factory PlayerInfos.fromJson(Map<String, dynamic> json) {
    return PlayerInfos(
      username: json['username'],
      socketId: json['socketId'],
    );
  }
}
