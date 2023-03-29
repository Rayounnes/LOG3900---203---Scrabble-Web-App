import 'package:app/models/word_training_model.dart';
class WordsOrthography {
  List<WordTraining> words;
  WordsOrthography(
      {required this.words});

  factory WordsOrthography.fromJson(Map<String, dynamic> json) {
    return WordsOrthography(
      words: json['words'],
    );
  }

  Map toJson() => {
        'words': words,
      };
}