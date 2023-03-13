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

  @override
  void initState() {
    super.initState();

    _initializeCamera();
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
      await File(filePath).writeAsBytes(await image.readAsBytes());

      setState(() {
        _imagePath = filePath;
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
                SizedBox(
                  width: 600,
                  height: 800,
                  child: CameraPreview(controller),
                ),
                Align(
                  alignment: Alignment.bottomCenter,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 16.0),
                    child: FloatingActionButton(
                      onPressed: _takePicture,
                      child: Icon(color:_imagePath.isEmpty ? Colors.red[300] : Color.cyan,Icons.camera_alt),
                    ),
                  ),
                ),
                if (_imagePath.isNotEmpty)
                  Center(
                    child: Image.file(
                      File(_imagePath),
                      height: 200,
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
