class GamePlayerInfos {
  String username, socket, icon;
  int points, tilesLeft;
  List<String> tiles;
  bool isVirtualPlayer, isTurn;
  GamePlayerInfos({
    required this.username,
    required this.socket,
    required this.points,
    required this.tiles,
    required this.tilesLeft,
    required this.isVirtualPlayer,
    this.isTurn = false,
    this.icon = '',
  });

  factory GamePlayerInfos.fromJson(Map<String, dynamic> json) {
    return GamePlayerInfos(
      username: json["username"],
      points: json["points"],
      isVirtualPlayer: json["isVirtualPlayer"],
      tiles: List<String>.from(json['tiles']),
      tilesLeft: json["tilesLeft"],
      socket: json["socket"],
      isTurn: false,
      icon: "",
    );
  }
}
