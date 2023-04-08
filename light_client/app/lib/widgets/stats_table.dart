import 'dart:core';
import 'package:flutter/material.dart';
import 'package:pie_chart/pie_chart.dart';

import '../services/translate_service.dart';


class StatsTable extends StatefulWidget {
  final int gamesPlayed;
  final int gamesWon;
  final int avgPointsPerGame;
  final String avgTimePerGame;

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
  String lang = "en";
  TranslateService translate = TranslateService();


  @override
  void initState() {
    super.initState();
    dataMap[translate.translateString(lang,'Parties perdues')] = widget.gamesPlayed.toDouble() - widget.gamesWon.toDouble();
    dataMap[translate.translateString(lang,'Parties gagnées')] = widget.gamesWon.toDouble();
    dataMap[translate.translateString(lang,'Parties jouées') + ' = ${widget.gamesPlayed}'] = 0.0;
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
                TableCell(verticalAlignment: TableCellVerticalAlignment.middle,
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(translate.translateString(lang,'Moyenne de points par partie'),
                        style: TextStyle(fontSize: 18)),
                  ),
                ),
                TableCell(verticalAlignment: TableCellVerticalAlignment.middle,
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Center(
                      child: Text(widget.avgPointsPerGame.toString(),
                          style: TextStyle(
                              fontSize: 18)),
                    ),
                  ),
                )
              ],
            ),
            TableRow(
              children: [
                TableCell(verticalAlignment: TableCellVerticalAlignment.middle,
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(translate.translateString(lang,'Temps moyen par partie'),
                        style: TextStyle(fontSize: 18)),
                  ),
                ),
                TableCell(verticalAlignment: TableCellVerticalAlignment.middle,
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Center(
                      child: Text(
                          widget.avgTimePerGame,
                          style:
                              TextStyle(fontSize: 18)),
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
