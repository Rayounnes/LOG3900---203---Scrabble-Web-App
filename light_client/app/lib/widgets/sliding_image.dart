import 'dart:core';
import 'package:flutter/material.dart';

class SlidingImage extends StatefulWidget {
  final List<String> imagePath;
  final List<String> imageText;
  final String helpTopic;

  const SlidingImage({super.key, required this.imagePath,required this.imageText, required this.helpTopic});

  @override
  _SlidingImageState createState() => _SlidingImageState();
}

class _SlidingImageState extends State<SlidingImage> {
  int currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.helpTopic),
      ),
      body: PageView.builder(
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
                        (i) =>
                        Container(
                          width: 10.0,
                          height: 10.0,
                          margin: EdgeInsets.symmetric(horizontal: 4.0),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color:
                            currentIndex == i ? Colors.blue : Colors
                                .grey[400],
                          ),
                        ),
                  ),
                ),
              ),
              Container(
                  color:Color.fromARGB(255, 255, 237, 164) ,child: Padding(
                    padding: const EdgeInsets.all(15.0),
                    child: Text(widget.imageText[index],style: TextStyle(
                    fontSize: 18)),
                  )),
              Image.asset(
                widget.imagePath[index],
                width: MediaQuery
                    .of(context)
                    .size
                    .width / 2,
              ),
            ],
          );
        },
        onPageChanged: (index) {
          setState(() {
            currentIndex = index;
          });
        },
      ),
    );
  }
}
