import 'package:app/constants/widgets.dart';
import 'package:just_audio/just_audio.dart' as audio;

import 'package:injectable/injectable.dart';
import 'package:just_audio/just_audio.dart';

@injectable
class MusicService {
  double xPosition = 680;
  double yPosition = 150;
  double volume = 0.7;
  int musicID = -1;
  bool isPlaying = true;

  final audio.AudioPlayer audioPlayer = audio.AudioPlayer();

  static final MusicService _instance = MusicService._internal();

  factory MusicService() {
    return _instance;
  }

  MusicService._internal();

  void playMusic(String musicPath, [bool isBackgroundMusic = true]) async {
    await audioPlayer.setAsset(musicPath);
    await audioPlayer.setVolume(isBackgroundMusic ? volume : 1.0);
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

  void previousMusic() {
    musicID = musicID == 0 ? MUSIC_PATH.length - 1 : musicID - 1;
    playMusic(MUSIC_PATH[musicID], true);
  }

  Future<void> volumeUp() async {
    if(volume < 1.0){
      volume += 0.15;
      await audioPlayer.setVolume(volume);
      resumeMusic();
    }
  }

  void volumeDown() async {
    if(volume > 0.0){
      volume -= 0.15;
      await audioPlayer.setVolume(volume);
      resumeMusic();
    }
  }

  void automaticPlaylist() {
    audioPlayer.playerStateStream.listen((state) {
      Duration? musicDuration = audioPlayer.duration;
      Duration musicPosition = audioPlayer.position;

      if (state.processingState == audio.ProcessingState.completed) {
        print("Music has ended $musicPosition - $musicDuration and time is");
        isPlaying = false;
      }
      if(!isPlaying)nextMusic();
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
