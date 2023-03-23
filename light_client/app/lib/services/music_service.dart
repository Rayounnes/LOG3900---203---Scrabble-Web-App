import 'dart:typed_data';

import 'package:app/constants/widgets.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/services.dart';
import 'package:just_audio/just_audio.dart' as audio;

import 'package:injectable/injectable.dart';
import 'package:just_audio/just_audio.dart';

@injectable
class MusicService {
  int musicID = 0;
  bool isPlaying = true;

  final audio.AudioPlayer audioPlayer = audio.AudioPlayer();

  static final MusicService _instance = MusicService._internal();

  factory MusicService() {
    return _instance;
  }

  MusicService._internal();

  void playMusic(String musicPath, [bool isBackgroundMusic = true]) async {
    await audioPlayer.setAsset(musicPath);
    await audioPlayer.setVolume(isBackgroundMusic ? 0.7 : 1.0);
    isPlaying = true;
    await audioPlayer.play();
  }

  void pauseMusic() async {
    isPlaying = false;
    audioPlayer.pause();
  }

  void resumeMusic() async {
    isPlaying = true;
    await audioPlayer.play();
  }

  void disposeMusic() async {
    stopMusic();
    audioPlayer.dispose();
  }

  void stopMusic() async {
    isPlaying = false;
    await audioPlayer.stop();
  }

  void nextMusic() {
    musicID = musicID == MUSIC_PATH.length - 1 ? 0 : musicID + 1;
    playMusic(MUSIC_PATH[musicID], true);
  }

  void automaticPlaylist() {
    audioPlayer.playerStateStream.listen((state) {
      Duration? musicDuration = audioPlayer.duration;
      Duration musicPosition = audioPlayer.position;
      Duration timeOut = Duration(minutes: 1, seconds: 23);

      if (state.processingState == audio.ProcessingState.completed) {
        print("Music has ended $musicPosition - $musicDuration and time is");
        isPlaying = false;
        stopMusic();
        // getPlaylist();
      }
    });
  }

  getPlaylist() {
    nextMusic();
    var playList = MUSIC_PATH.sublist(musicID);
    for (var i = 0; i < playList.length; i++) {
      ConcatenatingAudioSource(children: [
        AudioSource.asset(playList[musicID + i]),
      ]);
    }
    audioPlayer.play();
  }
}
