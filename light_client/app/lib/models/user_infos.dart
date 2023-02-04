import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:injectable/injectable.dart';

@injectable
class UserInfos {
  String username = "test";
  static final UserInfos _instance = UserInfos._internal();

  factory UserInfos() {
    return _instance;
  }

  // This named constructor is the "real" constructor
  // It'll be called exactly once, by the static property assignment above
  // it's also private, so it can only be called in this class
  UserInfos._internal();

  setUser(String username) {
    this.username = username;
  }

  get user {
    return username;
  }
}
