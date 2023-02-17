// { title: 'Mon dictionnaire', fileName: 'dictionnary.json' }

class Dictionary {
  final String title, fileName;
  const Dictionary({required this.title, required this.fileName});

  Map toJson() => {
        'title': title,
        'filename': fileName,
      };

}
