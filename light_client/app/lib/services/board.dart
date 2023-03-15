import '../models/tile.dart';
import '../models/letter.dart';
import '../models/Words_Args.dart';

import 'dart:collection';
import 'package:injectable/injectable.dart';

const BOARD_SIZE = 15;

@injectable
class Board {
  static final wordStarted = false;
  static final endBoard = BOARD_SIZE;
  static final boardMatrix = [];
  static final Board _instance = Board._internal();

  factory Board() {
    for (var i = 0; i < endBoard; i++) {
      boardMatrix.add([]);
      for (var j = 0; j < endBoard; j++) {
        boardMatrix[i].add(Tile(letter: '', isFilled: false));
      }
    }
    return _instance;
  }

  Board._internal();

  constructor() {
    intializeBoard();
  }

  intializeBoard() {
    for (var i = 0; i < endBoard; i++) {
      boardMatrix[i] = [];
      for (var j = 0; j < endBoard; j++) {
        boardMatrix[i][j] = Tile(letter: '', isFilled: false);
      }
    }
  }

  setColor(int line, int column, String color) {
    boardMatrix[line - 1][column - 1].color = color;
  }

  isTileFilled(int line, int column) {
    if (line <= 14 && line >= 0 && column <= 14 && column >= 0) {
      boardMatrix[line][column].isFilled = true;
    }
  }

  isNotFilled(int line, int column) {
    boardMatrix[line - 1][column - 1].isFilled = false;
  }

  getIsFilled(int line, int column) {
    return boardMatrix[line - 1][column - 1].isFilled;
  }

  setLetter(int line, int column, String letter) {
    boardMatrix[line][column].letter = letter;
    isTileFilled(line, column);
  }

  // getColor(line: number, column: number) {
  //     return boardMatrix[line - 1][column - 1].color;
  // }

  isFilledForEachLetter(List<Letter> letters) {
    for (var letter in letters) {
      isTileFilled(letter.line, letter.column);
    }
  }

  setLetterForEachLetters(List<Letter> letters) {
    for (var letter in letters) {
      setLetter(letter.line, letter.column, letter.value);
    }
  }

  verifyHorizontal(List<Letter> letters) {
    int firstLetterLine = letters[0].line;
    for (var letter in letters) {
      if (firstLetterLine != letter.line) {
        return false;
      }
    }
    return true;
  }

  verifyVertical(List<Letter> letters) {
    int firstLetterColumn = letters[0].column;
    for (var letter in letters) {
      if (firstLetterColumn != letter.column) {
        return false;
      }
    }
    return true;
  }

  findFirstVerticalLetter(List<Letter> letters) {
    Letter minColumnLetter = letters[0];
    for (var letter in letters) {
      if (letter.line < minColumnLetter.line) {
        minColumnLetter = letter;
      }
    }
    return minColumnLetter;
  }

  findFirstHorizontalLetter(List<Letter> letters) {
    Letter minLineLetter = letters[0];
    for (var letter in letters) {
      if (letter.column < minLineLetter.column) {
        minLineLetter = letter;
      }
    }
    return minLineLetter;
  }

  createWord(List<Letter> letters, String orientation) {
    String value = '';
    for (var letter in letters) {
      value += letter.value;
    }
    WordArgs word = WordArgs();
    word.line = letters[0].line;
    word.column = letters[0].column;
    word.orientation = orientation;
    word.value = value;
    return word;
  }

  verifyStraightHorizontal(List<Letter> letters) {
    Letter startLetter = findFirstHorizontalLetter(letters);
    letters.sort((a, b) => a.column.compareTo(b.column));
    int currentPos = startLetter.column;
    for (var letter in letters) {
      if (letter.column != currentPos) {
        return;
      }
      currentPos++;
      while (getIsFilled(startLetter.line, currentPos)) {
        currentPos++;
      }
    }
    // for (var i = 1; i < letters.length; i++) {
    //   if (letters[i].column != letters[i - 1].column + 1) {
    //     return;
    //   }
    // }
    print("the word is valid horizoooooooooontal");
    print(createWord(letters, 'h'));
    return createWord(letters, 'h');
  }

  verifyStraightVertical(List<Letter> letters) {
    Letter startLetter = findFirstVerticalLetter(letters);
    letters.sort((a, b) => a.line.compareTo(b.line));
    // for (var i = 1; i < letters.length; i++) {
    //   if (letters[i].line != letters[i - 1].line + 1) {
    //     return;
    //   }
    // }
    int currentPos = startLetter.line;
    for (var letter in letters) {
      if (letter.line != currentPos) {
        return;
      }
      currentPos++;
      while (getIsFilled(startLetter.column, currentPos)) {
        currentPos++;
      }
    }

    print("the word is valid horizoooooooooontal");
    print(createWord(letters, 'v'));
    return createWord(letters, 'v');
  }

  verifyPlacement(List<Letter> letters) {
    //verifier horizontal
    int firstLetterColumn = letters[0].column;
    bool horizontal = verifyHorizontal(letters);
    bool vertical = verifyVertical(letters);

    if (verifyHorizontal(letters)) {
      return verifyStraightHorizontal(letters);
    }

    if (verifyVertical(letters)) {
      return verifyStraightVertical(letters);
    }
    return;
  }
}
