class LoginInfos {
  String username;
  String password;
  LoginInfos({required this.username, required this.password});

  Map toJson() => {
        'username': username,
        'password': password,
      };
}
