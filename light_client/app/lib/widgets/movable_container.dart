import 'package:flutter/material.dart';

class MovableContainer extends StatefulWidget {
  @override
  _MovableContainerState createState() => _MovableContainerState();
}

class _MovableContainerState extends State<MovableContainer>
    with SingleTickerProviderStateMixin {
  bool isExpanded = false;
  double boxHeight = 40;
  double boxWidth = 40;
  Offset position = Offset(0.0, 0.0);
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: Duration(seconds: 1),
    )..repeat(reverse: true);
    _animation = CurvedAnimation(parent: _controller, curve: Curves.easeInOut);
  }

  void _setDefaultBox() {
    boxHeight = 40;
    boxWidth = 40;
    isExpanded = false;
  }

  void _setExpandBox() {
    boxHeight = 100;
    boxWidth = 100;
    isExpanded = true;
  }

  void _changeBoxSize() {
    setState(() {
      isExpanded ? _setDefaultBox() : _setExpandBox();
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
        onTap: _changeBoxSize,
        child: Scaffold(
          backgroundColor: Color.fromARGB(255, 255, 199, 125),
          body: Stack(
            children: [
              Positioned(
                left: position.dx,
                top: position.dy,
                child: Draggable(
                  feedback: Container(
                    width: boxWidth,
                    height: boxHeight,
                    color: Color.fromARGB(255, 0, 167, 64).withOpacity(0.5),
                  ),
                  child: AnimatedContainer(
                    duration: Duration(seconds: 1),
                    color: Color.fromARGB(255, 63, 34, 34),
                    height: boxHeight,
                    width: boxWidth,
                  ),
                  onDraggableCanceled: (velocity, offset) {
                    setState(() {
                      position = offset;
                    });
                  },
                ),
              ),
            ],
          ),
        ));
  }
}
