import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:app/constants/server_api.dart';
import 'package:app/models/login_infos.dart';

class ApiService {

  /** ************** user Login methods *******************************/

  Future<int> loginUser(LoginInfos user) async {
    final response = await http.post(
      Uri.parse(ApiConstants.baseUrl + "/api/login/user"),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(user),
    );
    return response.statusCode;
  }

  Future<int> logoutUser(String username) async {
    final response = await http.post(
      Uri.parse(ApiConstants.baseUrl + "/api/login/user/disconnect/$username"),
    );
    return response.statusCode;
  }

  Future<int> createUser(LoginInfos user) async {
    final response = await http.put(
      Uri.parse(ApiConstants.baseUrl + '/api/login/userLightClient'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(user),
    );
    return response.statusCode;
  }

  /** ************** chat channel method *******************************/
  Future<List<dynamic>> getUserChannels(String username) async {
    final response = await http.get(
      Uri.parse(ApiConstants.baseUrl + '/api/channels/channel/'+username),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get user channels');
    }
}

Future<List<dynamic>> getAllChannels() async {
    final response = await http.get(
      Uri.parse(ApiConstants.baseUrl + '/api/channels/allchannels'),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get all channels');
    }
}


Future<List<dynamic>> getAllUsers() async {
    final response = await http.get(
      Uri.parse(ApiConstants.baseUrl + '/api/channels/allusers'),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);

    } else {
      throw Exception('Failed to get all channels');
    }
}

Future<List<dynamic>> getChannelsOfUsers(String username) async {
    final response = await http.get(
      Uri.parse(ApiConstants.baseUrl + '/api/channels/usersChannels/'+username),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);

    } else {
      throw Exception('Failed to get all channels');
    }
}

Future<List<dynamic>> getMessagesOfChannel(String channel) async {
    final response = await http.get(
      Uri.parse(ApiConstants.baseUrl + '/api/channels/messagesChannels/'+channel),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);

    } else {
      throw Exception('Failed to get all channels');
    }
}

  Future<bool> pushIcon(String icon, String username) async {
    final response = await http.post(
      Uri.parse('${ApiConstants.baseUrl}/api/icons/add'),
      body: {
        'image': jsonEncode(icon),
        'username': jsonEncode(username),
      },
    );
    if (response.statusCode == 200) {
      return true;
    } else {
      throw Exception('Failed to push icon');

    }
  }

  Future<bool> changeUsername(String newUsername, String oldUsername) async {
    final response = await http.post(
      Uri.parse('${ApiConstants.baseUrl}/api/login/user/changeusername'),
      body: {
        'newU': jsonEncode(newUsername),
        'old': jsonEncode(oldUsername),
      },
    );
    if (response.statusCode == 200) {
      return true;
    } else {
      throw Exception('Failed to change username');

    }
  }

  Future<bool> changePassword(String username, String password) async {
    final response = await http.post(
      Uri.parse('${ApiConstants.baseUrl}/api/login/user/changepassword'),
      body: {
        'username': jsonEncode(username),
        'password': jsonEncode(password),
      },
    );
    if (response.statusCode == 200) {
      return true;
    } else {
      throw Exception('Failed to change password');

    }
  }

  Future<bool> changeIcon(String oldUsername, String icon) async {
    final response = await http.post(
      Uri.parse('${ApiConstants.baseUrl}/api/icons/change'),
      body: {
        'username': jsonEncode(oldUsername),
        'image': jsonEncode(icon),
      },
    );
    if (response.statusCode == 200) {
      return true;
    } else {
      throw Exception('Failed to change icon');

    }
  }

  Future<List<dynamic>> getUserIcon(String username) async {
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/api/icons/getusericon/$username'),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);

    } else {
      throw Exception("Échec de récupération d'image");
    }
  }

  Future<List<dynamic>> getSecurityQsts() async {
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/api/security/questions'),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);

    } else {
      throw Exception("Échec de récupération des questions de sécurité");
    }
  }

  Future<dynamic> getSecurityQst(int index) async {
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/api/security/questions/$index'),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);

    } else {
      throw Exception("Échec de récupération de la question de sécurité");
    }
  }

  Future<dynamic> getSecurityQstID() async {
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/api/login/securityId'),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);

    } else {
      throw Exception("Échec de récupération de l'ID de sécurité");
    }
  }

  Future<dynamic> getSecurityAnswer() async {
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/api/login/securityAnswer'),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);

    } else {
      throw Exception("Échec de récupération de la réponse de sécurité");
    }
  }

  Future<List<dynamic>> getConnexionHistory(String username) async {
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/api/login/connexionhistory/$username'),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);

    } else {
      throw Exception("Échec de récupération d'image");
    }
  }



}
