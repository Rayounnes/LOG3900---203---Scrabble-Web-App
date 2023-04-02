import 'package:flutter/material.dart';
import '../services/music_service.dart';

class MusicAppBar extends StatefulWidget {

  @override
  State<MusicAppBar> createState() => _MusicAppBarState();
}

class _MusicAppBarState extends State<MusicAppBar> {
  MusicService musicService = MusicService();

  @override
  void initState() {
    super.initState();
    if(musicService.isPlaying){musicService.resumeMusic();}
  }

  @override
  void dispose() {
    super.dispose();
    musicService.stopMusic();
    if (ModalRoute.of(context)?.settings.name == '/loginScreen') {
      musicService.disposeMusic();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: musicService.xPosition,
      top: musicService.yPosition,
      child: GestureDetector(
        onPanUpdate: (gesture) {
          setState(() {
            musicService.xPosition += gesture.delta.dx;
            musicService.yPosition += gesture.delta.dy;
          });
        },
        child: CircleAvatar(backgroundColor:Color.fromARGB(255, 231, 228, 52),
          radius: 35,
          child: Center(
            child: IconButton(
              icon: Icon(Icons.audiotrack,
                  size: 35, color: Color.fromARGB(255, 23, 0, 0)),
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
          color: Color.fromARGB(253, 229, 223, 223),
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  musicService.musicID != -1 ?'Music ${musicService.musicID}.mp3':
                  'Lancer la playlist',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold,color: Color.fromARGB(
                      255, 0, 0, 0)),
                ),
                SizedBox(height: 50.0),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(iconSize: 25,
                      icon: Icon(Icons.volume_down,
                          color: Color.fromARGB(255, 188, 81, 234)),
                      onPressed: () {
                        setState(() {
                          musicService.volumeDown();
                        });
                      },
                    ),
                    if(musicService.musicID != -1)IconButton(iconSize: 25,
                      icon: Icon(Icons.skip_previous_rounded,
                          color: Color.fromARGB(255, 246, 174, 10)),
                      onPressed: () {
                        setState(() {
                          musicService.previousMusic();
                        });
                      },
                    ),
                    if(musicService.musicID != -1)IconButton(iconSize: 30,
                      icon: Icon(
                          musicService.isPlaying
                              ? Icons.pause
                              : Icons.play_arrow,
                          color: musicService.isPlaying
                              ? Color.fromARGB(255, 255, 57, 31)
                              : Color.fromARGB(255, 14, 117, 25)),
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
                    IconButton(iconSize: 25,
                      icon: Icon(musicService.musicID != -1 ? Icons.skip_next_rounded:
                          Icons.queue_music,
                          color: Color.fromARGB(255, 246, 174, 10)),
                      onPressed: () {
                        setState(() {
                          musicService.nextMusic();
                        });
                      },
                    ),
                    IconButton(iconSize: 25,
                      icon: Icon(Icons.volume_up,
                          color: Color.fromARGB(255, 188, 81, 234)),
                      onPressed: () {
                        setState(() {
                          musicService.volumeUp();
                        });
                      },
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
