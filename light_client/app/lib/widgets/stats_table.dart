import 'dart:core';
import 'package:flutter/material.dart';
import 'package:pie_chart/pie_chart.dart';


class StatsTable extends StatefulWidget {
  final int gamesPlayed;
  final int gamesWon;
  final double avgPointsPerGame;
  final Duration avgTimePerGame;

  const StatsTable({
    Key? key,
    required this.gamesPlayed,
    required this.gamesWon,
    required this.avgPointsPerGame,
    required this.avgTimePerGame,
  }) : super(key: key);
  @override
  _StatsTableState createState() => _StatsTableState();
}

class _StatsTableState extends State<StatsTable> {

  Map<String, double> dataMap = {};

  @override
  void initState() {
    super.initState();
    dataMap['Parties perdues'] = widget.gamesPlayed.toDouble() - widget.gamesWon.toDouble();
    dataMap['Parties gagnées'] = widget.gamesWon.toDouble();
    dataMap['Parties jouées = ${widget.gamesPlayed}'] = 0.0;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Table(
          border: TableBorder.all(),
          children: [
            TableRow(
              children: [
                ColoredBox(
                  color: Color.fromARGB(255, 248, 212, 172),
                  child: TableCell(verticalAlignment: TableCellVerticalAlignment.middle,
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Text('Moyenne de points par partie',
                          style: TextStyle(fontSize: 18)),
                    ),
                  ),
                ),
                ColoredBox(
                  color: Color.fromARGB(255, 248, 212, 172),
                  child: TableCell(verticalAlignment: TableCellVerticalAlignment.middle,
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Center(
                        child: Text(widget.avgPointsPerGame.toStringAsFixed(2),
                            style: TextStyle(
                                fontSize: 18)),
                      ),
                    ),
                  ),
                )
              ],
            ),
            TableRow(
              children: [
                ColoredBox(
                  color: Color.fromARGB(255, 248, 228, 198),
                  child: TableCell(verticalAlignment: TableCellVerticalAlignment.middle,
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Text('Temps moyen par partie',
                          style: TextStyle(fontSize: 18)),
                    ),
                  ),
                ),
                ColoredBox(
                  color: Color.fromARGB(255, 248, 228, 198),
                  child: TableCell(verticalAlignment: TableCellVerticalAlignment.middle,
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Center(
                        child: Text(
                            widget.avgTimePerGame.inMinutes.toString() + ' minutes',
                            style:
                                TextStyle(fontSize: 18)),
                      ),
                    ),
                  ),
                )
              ],
            ),
          ],
        ),
        Padding(
          padding: const EdgeInsets.only(top:20.0),
          child: SizedBox(
            height: 300,
              child: PieChart(dataMap: dataMap)),
        )
      ],
    );
  }
}
