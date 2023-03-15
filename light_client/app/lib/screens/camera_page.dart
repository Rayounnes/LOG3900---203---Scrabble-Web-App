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
  String _imagePath = '';
  int pictureCounter = 0;
  bool isValid = false;

  @override
  void initState() {
    super.initState();
    _initializeCamera();
    _takePicture();
  }

  Future<void> _initializeCamera() async {
    final cameras = await availableCameras();
    final camera = cameras.first;

    controller = CameraController(
      camera,
      ResolutionPreset.max,
    );
    initializeController = controller.initialize();
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  Future<void> _takePicture() async {
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
        _imagePath = filePath;
        pictureCounter +=1;
        isValid = pictureCounter>1? true:false;
      });
    } catch (e) {
      print(e);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: FutureBuilder(
        future: initializeController,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            return Stack(
              children: [
                if(!isValid)
                  Center(
                    child: SizedBox(
                      height: 900,
                      child: CameraPreview(controller),
                    ),
                  ),
                if (_imagePath.isNotEmpty && pictureCounter > 1 && isValid)
                  Center(
                    child: Image.file(
                      File(_imagePath),
                      height: 900,
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
                            onPressed:(){
                              setState(() {
                                isValid = false;
                              });
                            },
                            child: Icon(Icons.close)),
                        Padding(
                          padding: const EdgeInsets.only(right: 50.0,left: 50),
                          child: FloatingActionButton(
                            onPressed: _takePicture,
                            child: _imagePath.isEmpty ? Icon(
                                color:Colors.red[200],
                                Icons.camera): Icon(
                                color:Color.fromARGB(255, 23, 46, 65),
                                Icons.camera_alt) ,
                          ),
                        ),
                        FloatingActionButton(
                          onPressed: () {},
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
