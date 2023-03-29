class LoginInfos {
  String username;
  String password;
  String? email;
  String? icon;
  String? socket;
  String? qstIndex;
  String? qstAnswer;

  LoginInfos(
      {required this.username,
      required this.password, this.email,
      this.icon,this.socket,this.qstIndex,this.qstAnswer});

  Map toJson() => {
        'username': username,
        'password': password,
        'email': email,
        'icon': icon,
        'socket': socket,
        'qstIndex': qstIndex,
        'qstAnswer': qstAnswer,
  };
}
