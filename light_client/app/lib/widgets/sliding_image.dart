import 'dart:core';
import 'package:flutter/material.dart';

class SlidingImage extends StatefulWidget {
  final List<String> imagePath;
  final List<String> imageText;
  final String helpTopic;

  const SlidingImage(
      {super.key,
      required this.imagePath,
      required this.imageText,
      required this.helpTopic});

  @override
  _SlidingImageState createState() => _SlidingImageState();
}

class _SlidingImageState extends State<SlidingImage> {
  int currentIndex = 0;
  PageController pageController = PageController();

  @override
  void initState() {
    super.initState();
    pageController = PageController(initialPage: 0);
  }

  @override
  void dispose() {
    pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Aide (${widget.helpTopic})"),
      ),
      body: Container(color: Color.fromARGB(255, 145, 213, 161),
        child: PageView.builder(
          controller: pageController,
          itemCount: widget.imagePath.length,
          itemBuilder: (context, index) {
            return Flex(
              direction: Axis.vertical,
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Padding(
                  padding: EdgeInsets.symmetric(vertical: 16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      widget.imagePath.length,
                      (i) => Container(
                        width: 20.0,
                        height: 20.0,
                        margin: EdgeInsets.symmetric(horizontal: 8.0),
                        child: ElevatedButton(
                            style: ButtonStyle(
                              backgroundColor: MaterialStateProperty.resolveWith<Color?>(
                                    (Set<MaterialState> states) {
                                    return currentIndex == i ? Color.fromARGB(
                                        255, 0, 0, 0) : Color.fromARGB(
                                        255, 255, 255, 255);
                                },
                              ),
                            ),
                            onPressed: () {
                              setState(() {
                                pageController.animateToPage(i,
                                    duration: Duration(milliseconds: 500),
                                    curve: Curves.easeInOut);
                              });
                            },
                            child: null),
                      ),
                    ),
                  ),
                ),
                Container(
                    color: Color.fromARGB(255, 255, 237, 164),
                    child: Padding(
                      padding: const EdgeInsets.all(15.0),
                      child: Text(widget.imageText[index],textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 18)),
                    )),
                Image.asset(
                  widget.imagePath[index],
                ),
                Container(),
              ],
            );
          },
          onPageChanged: (index) {
            setState(() {
              currentIndex = index;
            });
          },
        ),
      ),
    );
  }
}
