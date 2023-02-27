import 'package:app/constants/widgets.dart';
import 'package:flutter/widgets.dart';
import 'package:injectable/injectable.dart';

@injectable
class TilePlacement {
  static final List<double> axisX = [];
  static final List<double> axisY = [];
  static final TilePlacement _instance = TilePlacement._internal();

  factory TilePlacement() {
    for (int i = 0; i <= NB_OF_TILE; i++) {
      axisX.add(LEFT_BOARD_POSITION + i * 50);
    }
    for (int j = 0; j <= NB_OF_TILE; j++) {
      axisY.add(TOP_BOARD_POSITION + j * 50);
    }
    return _instance;
  }

  TilePlacement._internal();

  Offset setTileOnBoard(Offset position, int tileID) {
    Offset tilePosition = findTileCenter(position);
    double dx = findTileInterval(axisX, tilePosition.dx);
    double dy = findTileInterval(axisY, tilePosition.dy);
    tilePosition = Offset(dx, dy);

    if (dx == 0 || dy == 0) {
      tilePosition = setTileOnRack(tileID);
    }

    return tilePosition;
  }

  Offset setTileOnRack(int tileID) {
    return Offset(
        RACK_START_AXISX + TILE_SIZE * (tileID % RACK_SIZE), RACK_START_AXISY);
  }

  Offset findTileCenter(Offset position) {
    return Offset(position.dx + TILE_SIZE / 2, position.dy + TILE_SIZE / 2);
  }

  double findTileInterval(List<double> axis, double point) {
    double res = 0;
    for (int i = 1; i <= NB_OF_TILE; i++) {
      if (point < axis[i]) {
        res = point < axis[0] ? 0 : axis[i - 1];
        break;
      } else {
        res = 0;
      }
    }
    return res;
  }
}
