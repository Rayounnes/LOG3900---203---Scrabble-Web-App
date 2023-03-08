import 'package:app/screens/channels_page.dart';
import 'package:flutter/material.dart';
import 'package:app/main.dart';
import 'package:app/services/socket_client.dart';

class ParentWidget extends StatefulWidget {
  final Widget child;
  ParentWidget({super.key, required this.child});

  @override
  State<ParentWidget> createState() => _ParentWidgetState();
}

class _ParentWidgetState extends State<ParentWidget> {
  final GlobalKey<NavigatorState> _navigatorKey = GlobalKey<NavigatorState>();
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    bool keyboardIsOpened = MediaQuery.of(context).viewInsets.bottom != 0.0;
    return Scaffold(
        //bottomNavigationBar: HomePage(),
        backgroundColor: Colors.blueGrey,
        body: Stack(children: [widget.child, chatPopup(context)]),
        floatingActionButton: keyboardIsOpened
            ? null
            : ElevatedButton(
                onPressed: () {
                  setState(() {
                    _isExpanded = !_isExpanded;
                  });
                },
                style: ElevatedButton.styleFrom(
                    shape: const CircleBorder(),
                    backgroundColor: Colors.blue[200],
                    fixedSize: const Size(100, 100)),
                child: Icon(
                  _isExpanded ? Icons.close : Icons.chat_bubble_sharp,
                  size: 50,
                )));
  }

  Widget chatPopup(BuildContext context) {
    getIt<SocketService>().send("sendUsername"); 
    return Center(
      child: AnimatedContainer(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(9),
        ),
        curve: Curves.fastOutSlowIn,
        duration: Duration(milliseconds: 200),
        width: _isExpanded ? 1000 : 0,
        height: _isExpanded ? 1000 : 0,
        child: _isExpanded ? containerChild(context) : null,
      ),
    );
  }

  Widget containerChild(BuildContext context) {
    return Stack(
      children: [
        // Navigator for managing the different screens
        Navigator(
          key: _navigatorKey,
          initialRoute: '/',
          onGenerateRoute: (RouteSettings settings) {
            WidgetBuilder builder;
            switch (settings.name) {
              case '/':
                builder = (BuildContext context) => Channels();
                break;
              case '/chat':
                builder = (BuildContext context) => Channels();
                break;
              default:
                throw Exception('Invalid route: ${settings.name}');
            }
            return MaterialPageRoute(builder: builder, settings: settings);
          },
        ),
      ],
    );
  }
}
