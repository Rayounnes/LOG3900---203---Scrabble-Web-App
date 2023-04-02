import 'package:app/screens/camera_page.dart';
import 'package:app/screens/help_page.dart';
import 'package:app/screens/password_recovering_page.dart';
import 'package:app/services/music_service.dart';
import 'package:flutter/material.dart';
import 'screens/login_page.dart';
import 'screens/channels_page.dart';
import 'screens/home_page.dart';
import 'services/socket_client.dart';
import 'package:get_it/get_it.dart';
import 'screens/sign_page.dart';
import 'services/tile_placement.dart';
import 'services/user_infos.dart';
import 'screens/game_modes_page.dart';

final getIt = GetIt.instance;

void setup() {
  getIt.registerSingleton<SocketService>(SocketService());
  getIt.registerSingleton<UserInfos>(UserInfos());
  getIt.registerSingleton<MusicService>(MusicService());
  getIt.registerSingleton<TilePlacement>(TilePlacement());
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
        '/chatScreen': (context) => Channels(),
        '/gameChoicesScreen': (context) => GameModes(),
        '/signScreen': (context) => SignUp(),
        '/cameraScreen': (context) => CameraPage(),
        '/recoverPassScreen': (context) => RecoverAccountPage(),
        '/helpScreen': (context) => HelpSection(),
      },
      theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
          useMaterial3: true),
      debugShowCheckedModeBanner: false,
      home: LoginDemo(),
    );
  }
}
