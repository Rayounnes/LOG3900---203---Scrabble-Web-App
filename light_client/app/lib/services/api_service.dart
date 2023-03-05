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




}
