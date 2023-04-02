import 'dart:core';
import 'package:app/constants/widgets.dart';
import 'package:app/widgets/sliding_image.dart';
import 'package:flutter/material.dart';

class HelpSection extends StatefulWidget {
  @override
  State<HelpSection> createState() => _HelpSectionState();
}

@override
class _HelpSectionState extends State<HelpSection> {
  Map<int, List<String>> topicList = {};
  Map<int, List<String>> textList = {};
  final List<List<String>> topicImages = [
    CLASSIC_MODE_HELP_IMAGE,
    COOP_MODE_HELP_IMAGE,
    TRAINING_MODE_HELP_IMAGE,
    PROFILE_HELP_IMAGE,
    BONUS_HELP_IMAGE
  ];

  final List<List<String>> topicText = [
    CLASSIC_MODE_HELP_TEXT,
    COOP_MODE_HELP_TEXT,
    TRAINING_MODE_HELP_TEXT,
    PROFILE_HELP_TEXT,
    BONUS_HELP_TEXT,
  ];

  int currentIndex = 0;

  void initState() {
    super.initState();
    fillTopicImages();
  }

  void dispose() {
    super.dispose();
  }

  void fillTopicImages() {
    for (int i = 0; i < topicImages.length; i++) {
      topicList[i] = topicImages[i];
      textList[i] = topicText[i];
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Aide'),
      ),
      body: Scrollbar(
      thickness: 15,
      thumbVisibility: true,
        child: ListView.builder(
          itemCount: TOPICS_NAME.length,
          itemBuilder: (context, index) {
            return Flex(
              direction: Axis.horizontal,
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                SizedBox(
                  height: 350,
                  width: 350,
                  child: displayHelpTopics(context, topicList[index]!),
                ),
                Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Text(TOPICS_NAME[index]),
                    ),
                    FloatingActionButton(
                      backgroundColor: Color.fromARGB(255, 161, 205, 217),
                      onPressed: () => {
                        Navigator.push(context,
                            MaterialPageRoute(builder: (context) {
                          return SlidingImage(
                              imagePath: topicList[index]!,imageText: textList[index]!, helpTopic: TOPICS_NAME[index]);
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
    );
  }

  displayHelpTopics(BuildContext context, List<String> imagePath) {
    return Padding(
        padding: const EdgeInsets.all(50.0),
        child: Align(
          alignment: Alignment.topCenter,
          child: SizedBox(
            height: 200,
            child: Image.asset(
              imagePath[0],
              width: MediaQuery.of(context).size.width / 2,
            ),
          ),
        ));
  }
}
