import 'package:flutter/widgets.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:injectable/injectable.dart';

@injectable
class TilePlacement {
  static final List<double> axisX = [];
  static final List<double> axisY = [];
  static final TilePlacement _instance = TilePlacement._internal();

  static final TOP_BOARD = 225.0;
  static final BOTTOM_BOARD = 975.0;
  static final LEFT_BOARD = 25.0;
  static final RIGHT_BOARD = 775.0;
  static final tileSize = 50;
  static final nbOfTile = 15;

  factory TilePlacement() {
    for (int i = 0; i <= nbOfTile; i++) {
      axisX.add(LEFT_BOARD + i * 50);
    }
    for (int j = 0; j <= nbOfTile; j++) {
      axisY.add(TOP_BOARD + j * 50);
    }
    return _instance;
  }

  TilePlacement._internal();

  Offset setTile(Offset position) {
    Offset tilePosition = findTileCenter(position);
    double dx = findTileInterval(axisX, tilePosition.dx);
    double dy = findTileInterval(axisY, tilePosition.dy);
    print(dx);
    print(dy);

    return Offset(dx, dy);
  }

  Offset findTileCenter(Offset position) {
    return Offset(position.dx + tileSize / 2, position.dy + tileSize / 2);
  }

  double findTileInterval(List<double> axis, double point) {
    double res = 0;
    for (int i = 1; i <= nbOfTile; i++) {
      if (point < axis[i]) {
        res = axis[i - 1];
        break;
      }
    }
    return res;
  }
}
