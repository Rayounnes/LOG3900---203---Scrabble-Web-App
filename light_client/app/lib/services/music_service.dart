import 'package:app/constants/widgets.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:injectable/injectable.dart';

@injectable
class MusicService {
  int musicID = 0;
  AudioPlayer audioPlayer = AudioPlayer();

  static final MusicService _instance = MusicService._internal();

  factory MusicService() {
    return _instance;
  }

  MusicService._internal();

  Future<void> playMusic(
      [bool isBackgroundMusic = true, String musicPath = ""]) async {
    String audioasset = isBackgroundMusic ? MUSIC_PATH[musicID] : musicPath;
    await audioPlayer.play(AssetSource(audioasset),
        volume: isBackgroundMusic ? 0.5 : 0.8);
  }

  void pauseMusic() {
    audioPlayer.pause();
  }

  void resumeMusic() {
    audioPlayer.pause();
  }

  void stopMusic() {
    audioPlayer.stop();
  }

  void nextMusic() {
    musicID += 1;
    if (musicID == MUSIC_PATH.length) musicID = 0;
    playMusic();
  }

  void automaticPlaylist() {
    audioPlayer.onPlayerStateChanged.listen((event) {
      if (event == PlayerState.completed) {
        print("Music has ended");
        nextMusic();
      }
    });
  }
}
