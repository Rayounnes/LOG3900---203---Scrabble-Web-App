import 'package:app/screens/game_mode_choices.dart';
import 'package:flutter/material.dart';
import 'screens/login_page.dart';
import 'screens/channels_page.dart';
import 'screens/home_page.dart';
import 'services/socket_client.dart';
import 'package:get_it/get_it.dart';
import 'screens/sign_page.dart';
import 'services/user_infos.dart';
import 'screens/game_modes_page.dart';

final getIt = GetIt.instance;

void setup() {
  getIt.registerSingleton<SocketService>(SocketService());
  getIt.registerSingleton<UserInfos>(UserInfos());
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
      initialRoute: '/gameChoicesScreen',
      routes: {
        '/loginScreen': (context) => LoginDemo(),
        '/homeScreen': (context) => HomePage(),
        '/chatScreen': (context) => Channels(),
        '/gameChoicesScreen': (context) => GameModes(),
        '/classicModeScreen': (context) => GameChoices(),
        '/signScreen': (context) => SignUp(),
      },
      theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
          useMaterial3: true),
      debugShowCheckedModeBanner: false,
      home: LoginDemo(),
    );
  }
}
