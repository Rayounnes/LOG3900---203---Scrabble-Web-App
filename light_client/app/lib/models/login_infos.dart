class LoginInfos {
  String username;
  String password;
  String? email;
  String? icon;
  String? socket;

  LoginInfos(
      {required this.username,
      required this.password, this.email,
      this.icon,this.socket});

  Map toJson() => {
        'username': username,
        'password': password,
        'email': email,
        'icon': icon,
      'socket': socket,
  };
}
