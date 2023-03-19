class LoginInfos {
  String username;
  String password;
  String? email;
  String? icon;

  LoginInfos(
      {required this.username,
      required this.password, this.email,
      this.icon});

  Map toJson() => {
        'username': username,
        'password': password,
        'email': email,
        'icon': icon,
      };
}
