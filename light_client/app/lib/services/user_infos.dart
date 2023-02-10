import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:injectable/injectable.dart';

@injectable
class UserInfos {
  String username = "test";
  static final UserInfos _instance = UserInfos._internal();

  factory UserInfos() {
    return _instance;
  }

  UserInfos._internal();

  setUser(String username) {
    this.username = username;
  }

  get user {
    return username;
  }
}
