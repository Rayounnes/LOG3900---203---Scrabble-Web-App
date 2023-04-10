class Vec2 {
  int x = -1;
  int y = -1;

  Vec2({required this.x, required this.y});
  //  {
  //   this.language = language;
  //   this.theme = theme;
  // }
  Map toJson() => {
        'x': x,
        'y': y,
      };

  factory Vec2.fromJson(Map<String, dynamic> json) {
    return Vec2(
      x: json['x'],
      y: json['y'],
    );
  }
}
