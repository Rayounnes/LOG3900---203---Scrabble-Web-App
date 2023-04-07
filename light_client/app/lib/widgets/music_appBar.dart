import 'package:flutter/material.dart';
import '../main.dart';
import '../services/music_service.dart';
import '../services/translate_service.dart';

class MusicAppBar extends StatefulWidget {

  @override
  State<MusicAppBar> createState() => _MusicAppBarState();
}

class _MusicAppBarState extends State<MusicAppBar> {
  String lang = "en";
  TranslateService translate = new TranslateService();

  @override
  void initState() {
    super.initState();
    getIt<MusicService>().resumeMusic();
  }

  @override
  void dispose() {
    getIt<MusicService>().resumeMusic();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: getIt<MusicService>().xPosition,
      top: getIt<MusicService>().yPosition,
      child: GestureDetector(
        onPanUpdate: (gesture) {
          setState(() {
            getIt<MusicService>().xPosition += gesture.delta.dx;
            getIt<MusicService>().yPosition += gesture.delta.dy;
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
                  getIt<MusicService>().musicID != -1 ? translate.translateString(lang, "Musique")+'${getIt<MusicService>().musicID}.mp3':
                    translate.translateString(lang, "Lancer la liste de lecture"),
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.w600,color: Color.fromARGB(
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
                          getIt<MusicService>().volumeDown();
                        });
                      },
                    ),
                    if(getIt<MusicService>().musicID != -1)IconButton(iconSize: 25,
                      icon: Icon(Icons.skip_previous_rounded,
                          color: Color.fromARGB(255, 246, 174, 10)),
                      onPressed: () {
                        setState(() {
                          getIt<MusicService>().previousMusic();
                        });
                      },
                    ),
                    if(getIt<MusicService>().musicID != -1)IconButton(iconSize: 30,
                      icon: Icon(
                          getIt<MusicService>().isPlaying
                              ? Icons.pause
                              : Icons.play_arrow,
                          color: getIt<MusicService>().isPlaying
                              ? Color.fromARGB(255, 255, 57, 31)
                              : Color.fromARGB(255, 14, 117, 25)),
                      onPressed: () {
                        setState(() {
                          if (getIt<MusicService>().isPlaying) {
                            getIt<MusicService>().pauseMusic();
                          } else {
                            getIt<MusicService>().resumeMusic();
                          }
                        });
                      },
                    ),
                    IconButton(iconSize: 25,
                      icon: Icon(getIt<MusicService>().musicID != -1 ? Icons.skip_next_rounded:
                          Icons.queue_music,
                          color: Color.fromARGB(255, 246, 174, 10)),
                      onPressed: () {
                        setState(() {
                          getIt<MusicService>().nextMusic();
                        });
                      },
                    ),
                    IconButton(iconSize: 25,
                      icon: Icon(Icons.volume_up,
                          color: Color.fromARGB(255, 188, 81, 234)),
                      onPressed: () {
                        setState(() {
                          getIt<MusicService>().volumeUp();
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
