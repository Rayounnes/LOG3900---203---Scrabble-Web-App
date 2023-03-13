import 'package:app/constants/widgets.dart';
import 'package:flutter/material.dart';

import '../main.dart';
import '../services/music_service.dart';

class GameAppBar extends StatefulWidget {
  const GameAppBar();

  @override
  State<GameAppBar> createState() => _GameAppBarState();
}

class _GameAppBarState extends State<GameAppBar> {

  MusicService musicService = MusicService();

  @override
  void initState() {
    super.initState();
    musicService.musicID = 0;
    musicService.playMusic(MUSIC_PATH[musicService.musicID]);
    playBackgroundMusic();
  }

  void playBackgroundMusic() {
    setState(() => getIt<MusicService>().automaticPlaylist());
  }

  @override
  void dispose() {
    musicService.disposeMusic();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(45.0),
      child: Container(
        height: TILE_ADJUSTMENT + TILE_SIZE,
        width: TILE_ADJUSTMENT,
        color: Color.fromARGB(255, 107, 182, 201),
        child: Center(
          child: IconButton(
            icon: Icon(Icons.audiotrack,
                size: TILE_SIZE, color: Color.fromARGB(255, 12, 12, 12)),
            onPressed: () {
              showDialog(
                  context: context,
                  builder: (BuildContext context) {
                    return musicPopup(context);
                  });
            },
          ),
        ),
      ),
    );
  }

  Widget musicPopup(BuildContext context) {
    return StatefulBuilder(builder: (context, setState) {
      return Dialog(
        child: Container(
          height: 200,
          width: 250,
          color: Color.fromARGB(255, 163, 218, 240),
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Music ${musicService.musicID}.mp3',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 50.0),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: Icon(musicService.isPlaying ? Icons.pause : Icons.play_arrow,
                          color: musicService.isPlaying
                              ? Color.fromARGB(255, 255, 57, 31)
                              : Color.fromARGB(255, 35, 122, 0)),
                      onPressed: () {
                        setState(() {
                          if (musicService.isPlaying) {
                            musicService.pauseMusic();
                          } else {
                            musicService.resumeMusic();
                          }
                      
                        });
                        // add your on press functionality here
                      },
                    ),
                    Padding(
                      padding: const EdgeInsets.only(left: 70),
                      child: IconButton(
                        icon: Icon(Icons.skip_next_rounded,
                            color: Color.fromARGB(255, 218, 9, 218)),
                        onPressed: () {
                          setState(() {
                            musicService.nextMusic();
                          });
                          // add your on press functionality here
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      );
    });
  }
}
