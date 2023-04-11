import 'dart:core';
import 'package:app/constants/widgets.dart';
import 'package:app/widgets/parent_widget.dart';
import 'package:app/widgets/sliding_image.dart';
import 'package:flutter/material.dart';

import '../main.dart';
import '../models/personnalisation.dart';
import '../services/socket_client.dart';
import '../services/translate_service.dart';

class HelpSection extends StatefulWidget {
  @override
  State<HelpSection> createState() => _HelpSectionState();
}

@override
class _HelpSectionState extends State<HelpSection> {
  Map<int, List<String>> topicList = {};
  Map<int, List<String>> textList = {};
  TranslateService translate = TranslateService();
  late Personnalisation langOrTheme;
  String lang = "en";
  List<String> topicsName = [];
  final List<List<String>> topicImages = [
    CLASSIC_MODE_HELP_IMAGE,
    COOP_MODE_HELP_IMAGE,
    TRAINING_MODE_HELP_IMAGE,
    PROFILE_HELP_IMAGE,
    BONUS_HELP_IMAGE
  ];

  List<List<String>> topicText = [];

  int currentIndex = 0;

  void initState() {
    super.initState();
    handleSockets();
    if (lang == "en") {
      topicsName = TOPICS_NAME[1];
      topicText = [
        CLASSIC_MODE_HELP_TEXT[1],
        COOP_MODE_HELP_TEXT[1],
        TRAINING_MODE_HELP_TEXT[1],
        PROFILE_HELP_TEXT[1],
        BONUS_HELP_TEXT[1],
      ];
    } else {
      topicsName = TOPICS_NAME[0];
      topicText = [
        CLASSIC_MODE_HELP_TEXT[0],
        COOP_MODE_HELP_TEXT[0],
        TRAINING_MODE_HELP_TEXT[0],
        PROFILE_HELP_TEXT[0],
        BONUS_HELP_TEXT[0],
      ];
    }
    fillTopicImages();
  }

  void dispose() {
    super.dispose();
  }

  void handleSockets() {
    getIt<SocketService>().on("get-configs", (value) {
      langOrTheme = value;
    });
  }

  void fillTopicImages() {
    for (int i = 0; i < topicImages.length; i++) {
      topicList[i] = topicImages[i];
      textList[i] = topicText[i];
    }
  }

  @override
  Widget build(BuildContext context) {
    return ParentWidget(
        child: Scaffold(
      appBar: AppBar(
        title: Text(translate.translateString(lang, 'Aide')),
      ),
      body: Scrollbar(
        thickness: 15,
        thumbVisibility: true,
        child: Container(
          color: Color.fromARGB(255, 145, 213, 161),
          child: ListView.builder(
            itemCount: topicsName.length,
            itemBuilder: (context, index) {
              return Flex(
                direction: Axis.horizontal,
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  SizedBox(
                    height: 450,
                    width: 450,
                    child: displayHelpTopics(context, topicList[index]!),
                  ),
                  Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Container(
                          color: Color.fromARGB(255, 204, 238, 248),
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Text(topicsName[index],
                                style: TextStyle(
                                    fontSize: 20, fontWeight: FontWeight.w700)),
                          ),
                        ),
                      ),
                      ElevatedButton(
                        style: ButtonStyle(
                          foregroundColor:
                              MaterialStateProperty.resolveWith<Color?>(
                            (Set<MaterialState> states) {
                              return Color.fromARGB(255, 231, 227, 221);
                            },
                          ),
                          backgroundColor:
                              MaterialStateProperty.resolveWith<Color?>(
                            (Set<MaterialState> states) {
                              return Color.fromARGB(255, 31, 89, 96);
                            },
                          ),
                        ),
                        onPressed: () => {
                          Navigator.push(context,
                              MaterialPageRoute(builder: (context) {
                            return SlidingImage(
                              imagePath: topicList[index]!,
                              imageText: textList[index]!,
                              helpTopic: topicsName[index],
                              lang: lang,
                            );
                          }))
                        },
                        child: Icon(Icons.info),
                      ),
                    ],
                  ),
                ],
              );
            },
          ),
        ),
      ),
    ));
  }

  displayHelpTopics(BuildContext context, List<String> imagePath) {
    return Padding(
        padding: const EdgeInsets.all(50.0),
        child: Align(
          alignment: Alignment.topCenter,
          child: SizedBox(
            child: Image.asset(
              imagePath[0],
            ),
          ),
        ));
  }
}
