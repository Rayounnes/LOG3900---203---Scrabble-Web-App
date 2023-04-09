class Personnalisation {
  String language = "fr";
  String theme = "light";

  Personnalisation({required this.language, required this.theme});
  //  {
  //   this.language = language;
  //   this.theme = theme;
  // }
  Map toJson() => {
        'language': language,
        'theme': theme,
      };

  factory Personnalisation.fromJson(Map<String, dynamic> json) {
    return Personnalisation(
      language: json['language'],
      theme: json['theme'],
    );
  }
}
