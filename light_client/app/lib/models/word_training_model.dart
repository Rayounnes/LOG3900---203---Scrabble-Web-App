class WordTraining {
  String word;
  bool answer;
 
  
  WordTraining(
      {required this.word,
      required this.answer,
     
      });

  factory WordTraining.fromJson(Map<String, dynamic> json) {
    return WordTraining(
      word: json['word'],
      answer: json['answer'],
    );
  }

  Map toJson() => {
        'word': word,
        'answer': answer,
      };
}
