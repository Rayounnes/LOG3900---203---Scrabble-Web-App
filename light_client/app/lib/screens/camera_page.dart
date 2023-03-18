import 'dart:io';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:path_provider/path_provider.dart';

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
    controller.dispose();
    setState(() {
      isFrontCamera = !isFrontCamera;
      initializeCamera(direction);
    });
  }

  Future<void> takePicture() async {
    try {
      await initializeController;

      final image = await controller.takePicture();
      final directory = await getApplicationDocumentsDirectory();

      final fileName = DateTime.now().millisecondsSinceEpoch.toString();

      final filePath = '${directory.path}/$fileName.png';
      print(filePath);
      await File(filePath).writeAsBytes(await image.readAsBytes());
      //await Process.run('adb', ['shell', 'chmod', '644', filePath]);
      //await Process.run('adb', ['pull', filePath, 'D:/ImageTest Flutter']);

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
      backgroundColor: Color.fromARGB(255, 218, 228, 231),
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
                        FloatingActionButton(
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
                            onPressed: takePicture,
                            child: Icon(
                                color: Color.fromARGB(255, 23, 46, 65),
                                Icons.camera_alt),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(right: 50.0),
                          child: FloatingActionButton(
                            onPressed: () => {
                              isFrontCamera ? toggleCamera(0) : toggleCamera(1)
                            },
                            child: Icon(Icons.flip_camera_ios),
                          ),
                        ),
                        FloatingActionButton(
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
