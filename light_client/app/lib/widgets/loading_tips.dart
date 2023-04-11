import 'dart:async';
import 'package:app/services/socket_client.dart';
import 'package:app/services/api_service.dart';
import 'package:app/constants/widgets.dart';
import 'package:flutter/material.dart';

import '../main.dart';

class LoadingTips extends StatefulWidget {
  String lang;
  LoadingTips(this.lang);
  @override
  _LoadingTipsState createState() => _LoadingTipsState();
}

class _LoadingTipsState extends State<LoadingTips> {
  String tip = 'Loading...';
  Color color = Color.fromARGB(145, 124, 234, 255);
  int index = 0;
  List<String> tips = List.from(TIPS_FR);
  late Timer _timer;
  String lang = 'fr';

  @override
  void initState() {
    super.initState();
    handleSockets();
    getConfigs();
    changeTip();
  }

  getConfigs() {
    getIt<SocketService>().send("get-config");
  }

  handleSockets() {
    getIt<SocketService>().on("get-config", (value) {
      lang = value['langue'];
      // changeTip();
      if (mounted) {
        setState(() {
          lang = value['langue'];
          tips = lang == 'fr' ? List.from(TIPS_FR) : List.from(TIPS_EN);
        });
      }
    });
  }

  @override
  void dispose() {
    super.dispose();
    // pour detruire l objet qd on passe a la prochaine page
    _timer.cancel();
  }

  void changeTip() {
    setState(() {
      tips = widget.lang == 'fr' ? List.from(TIPS_FR) : List.from(TIPS_EN);
      index = index > 28 ? 1 : index;
      tip = tips[index];
      index = (index + 1) % tips.length;
    });
    _timer = Timer(Duration(seconds: 5), () => changeTip());
  }

  void updateTipColor() {
    if (index % 1 == 0) {
      color = Color.fromARGB(255, 88, 200, 234);
    }
    if (index % 2 == 0) {
      color = Color.fromARGB(255, 176, 120, 206);
    }
    if (index % 3 == 0) {
      color = Color.fromARGB(255, 224, 208, 128);
    }
  }

  @override
  Widget build(BuildContext context) {
    updateTipColor();
    return Container(
      height: 100,
      color: color,
      alignment: Alignment.center,
      child: AnimatedSwitcher(
        duration: Duration(milliseconds: 500),
        transitionBuilder: (Widget child, Animation<double> animation) {
          return FadeTransition(
            opacity: animation,
            child: SlideTransition(
              position: Tween<Offset>(
                begin: Offset(0.0, 1.0),
                end: Offset.zero,
              ).animate(animation),
              child: child,
            ),
          );
        },
        child: Text(
          tip,
          textAlign: TextAlign.center,
          key: ValueKey(tip),
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
