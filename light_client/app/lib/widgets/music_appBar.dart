import 'package:app/constants/widgets.dart';
import 'package:flutter/material.dart';

import '../main.dart';
import '../services/music_service.dart';

class MusicAppBar extends StatefulWidget {
  const MusicAppBar();

  @override
  State<MusicAppBar> createState() => _MusicAppBarState();
}

class _MusicAppBarState extends State<MusicAppBar> {
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
      child: Padding(
        padding: const EdgeInsets.only(top:8.0,bottom: 5.0,left: 8.0,right: 8.0),
        child: Container(
          width: TILE_ADJUSTMENT,
          color: Color.fromARGB(255, 80, 154, 64),
          child: Center(
            child: IconButton(
              icon: Icon(Icons.audiotrack,
                  size: 35, color: Color.fromARGB(255, 234, 238, 239)),
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
                      icon: Icon(
                          musicService.isPlaying
                              ? Icons.pause
                              : Icons.play_arrow,
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
