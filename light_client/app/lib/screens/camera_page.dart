import 'dart:io';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:image/image.dart' as img;
import 'package:path_provider/path_provider.dart';

import '../services/translate_service.dart';

class CameraPage extends StatefulWidget {
  @override
  _CameraPageState createState() => _CameraPageState();
}

class _CameraPageState extends State<CameraPage> {
  late CameraController controller;
  Future<void> initializeController = Future.value();
  String imagePath = '';
  int pictureCounter = 0;
  bool isValid = false;
  bool isFrontCamera = true;
  String lang = "en";
  TranslateService translate = TranslateService();

  @override
  void initState() {
    super.initState();
    initializeCamera(1);
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  Future<void> initializeCamera(int direction) async {
    final cameras = await availableCameras();
    var camera;
    setState(() {
       camera = cameras[direction];
    });

    controller = CameraController(
      camera,
      ResolutionPreset.max,
    );
    initializeController = controller.initialize();
    if (pictureCounter == 0) takePicture();
  }

  void toggleCamera(int direction) async{
    // controller.dispose();
    setState(() {
      isFrontCamera = !isFrontCamera;
      initializeCamera(direction);
    });
  }

  Future<void> takePicture() async {
    try {
      await initializeController;

      if(pictureCounter >= 1){
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              backgroundColor: Color.fromARGB(255, 64, 176, 119),
              duration: Duration(seconds: 2),
              content: Text("Image ...")),
        );
      }
      final image = await controller.takePicture();
      final directory = await getApplicationDocumentsDirectory();
      final fileName = DateTime.now().millisecondsSinceEpoch.toString();

      final filePath = '${directory.path}/$fileName.png';
      final originalImage = img.decodeImage(await image.readAsBytes());
      final compressedImage = img.encodeJpg(originalImage!, quality: 50);
      await File(filePath).writeAsBytes(compressedImage);
      //await File(filePath).writeAsBytes(await image.readAsBytes());

      setState(() {
        imagePath = filePath;
        pictureCounter += 1;
        isValid = pictureCounter > 1 ? true : false;
      });
    } catch (e) {
      print(e);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title:Text("Camera")),
      backgroundColor: Color.fromARGB(255, 156, 239, 171),
      body: FutureBuilder(
        future: initializeController,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            return Stack(
              children: [
                if (!isValid)
                  Center(
                    child: SizedBox(
                      height: 900,
                      child:
                          Hero(tag: 'camera', child: CameraPreview(controller)),
                    ),
                  ),
                if (imagePath.isNotEmpty && isValid)
                  Center(
                    child: Hero(
                      tag: 'profile-picture',
                      child: Image.file(
                        File(imagePath),
                        height: 900,
                      ),
                    ),
                  ),
                Align(
                  alignment: Alignment.bottomCenter,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 50.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        FloatingActionButton(backgroundColor: Colors.white70,
                            onPressed: pictureCounter > 1
                                ? () {
                                    setState(() {
                                      isValid = false;
                                    });
                                  }
                                : null,
                            child: Icon(Icons.close)),
                        Padding(
                          padding: const EdgeInsets.only(right: 50.0, left: 50),
                          child: FloatingActionButton(
                            heroTag: "tag1",
                            backgroundColor: imagePath.isNotEmpty && isValid ? Colors.blueGrey: Colors.white70,
                            onPressed:  imagePath.isNotEmpty && isValid ? null :takePicture,
                            child: Icon(
                                Icons.camera_alt),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(right: 50.0),
                          child: FloatingActionButton(
                            heroTag: "tag2",
                            backgroundColor: imagePath.isNotEmpty && isValid ? Colors.blueGrey: Colors.white70,
                            onPressed: imagePath.isNotEmpty && isValid ? null : () => {
                              isFrontCamera ? toggleCamera(0) : toggleCamera(1)
                            },
                            child: Icon(Icons.flip_camera_ios),
                          ),
                        ),
                        FloatingActionButton(
                          heroTag: "tag3",
                          backgroundColor: Colors.white70,
                            onPressed: pictureCounter > 1 ? () {
                              Navigator.pop(context, File(imagePath));
                            } : null,
                            child: Icon(Icons.done)),
                      ],
                    ),
                  ),
                ),
              ],
            );
          } else {
            return Center(child: CircularProgressIndicator());
          }
        },
      ),
    );
  }
}
