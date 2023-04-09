class Personnalisation {
  String language = "fr";
  String theme = "white";

  Personnalisation({required this.language, required this.theme});
  //  {
  //   this.language = language;
  //   this.theme = theme;
  // }
  Map toJson() => {
        'langue': language,
        'theme': theme,
      };

  factory Personnalisation.fromJson(Map<String, dynamic> json) {
    return Personnalisation(
      language: json['langue'],
      theme: json['theme'],
    );
  }
}
