import 'package:flutter/material.dart';
import 'screens/loginPage.dart';
import 'screens/discussionsPage.dart';
import 'screens/homePage.dart';
import 'services/socket_client.dart';
import 'package:get_it/get_it.dart';

final getIt = GetIt.instance;

void setup() {
  getIt.registerSingleton<SocketService>(SocketService());
  getIt<SocketService>().connect();
}

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  setup();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      initialRoute: '/loginScreen',
      routes: {
        '/loginScreen': (context) => LoginDemo(),
        '/homeScreen': (context) => HomePage(),
        '/chatScreen': (context) => Discussions(),
      },
      theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
          useMaterial3: true),
      debugShowCheckedModeBanner: false,
      home: LoginDemo(),
    );
  }
}
