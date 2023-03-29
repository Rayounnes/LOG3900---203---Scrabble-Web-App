import 'dart:developer';
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
      Uri.parse(ApiConstants.baseUrl + '/api/login/user'),
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
      Uri.parse(ApiConstants.baseUrl + '/api/channels/channel/' + username),
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
      Uri.parse(
          ApiConstants.baseUrl + '/api/channels/usersChannels/' + username),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get all channels');
    }
  }

  Future<List<dynamic>> getMessagesOfChannel(String channel) async {
    final response = await http.get(
      Uri.parse(
          ApiConstants.baseUrl + '/api/channels/messagesChannels/' + channel),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get all channels');
    }
  }

  /** ************** avatar method *******************************/
  Future<List<dynamic>> getAvatar(String username) async {
    final response = await http.get(
      Uri.parse(ApiConstants.baseUrl + '/api/icons/getusericon/' + username),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get user icon');
    }
  }

  /** ************** coins method *******************************/
  Future<List<dynamic>> getUserCoins(String username) async {
    final response = await http.get(
      Uri.parse(ApiConstants.baseUrl + '/api/login/getcoins/' + username),
    );
    if (response.statusCode == 200) {
      print("api response");
      print(jsonDecode(response.body).toList());
      // List<int> coinsList =
      //     (jsonDecode(response.body)).map((s) => int.parse(s)).toList();
      print(jsonDecode(response.body).toList());
      return jsonDecode(response.body).toList();
    } else {
      throw Exception('Failed to get user icon');
    }
  }

  Future<bool> addCoinsToUser(String username, int coinsToAdd) async {
    final response = await http.put(
      Uri.parse(ApiConstants.baseUrl + '/api/login/addcoins' + username),
      body: jsonEncode({"username": username, "coins": coinsToAdd}),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('coinsGetError');
    }
  }

/** ************** mode orthography method *******************************/
  Future<dynamic> getBestScore(String username) async {
    final response = await http.get(
      Uri.parse(ApiConstants.baseUrl +
          '/api/modeOrthography/scoreOrthography/' +
          username),
    );
    print(jsonDecode(response.body));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get best score');
    }
  }

  Future<List<dynamic>> getAllWords() async {
    final response = await http.get(
      Uri.parse(
          ApiConstants.baseUrl + '/api/modeOrthography/allWordsOrthography'),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get all words');
    }
  }

  Future<List<dynamic>> getAllBestScores() async {
    final response = await http.get(
      Uri.parse(ApiConstants.baseUrl + '/api/modeOrthography/allBestScores'),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get all words');
    }
  }
}
