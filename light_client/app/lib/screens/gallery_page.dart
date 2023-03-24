import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:flutter/material.dart';

class GalleryPage extends StatefulWidget {
  @override
  _GalleryPageState createState() => _GalleryPageState();
}

class _GalleryPageState extends State<GalleryPage> {
  File? imageFile;

  Future<void> pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      final file = File(pickedFile.path);
      final size = await file.length();
      if (size <= 50000) {
        setState(() {
          imageFile = File(pickedFile.path);
        });
      }else{
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              backgroundColor: Colors.blue,
              duration: Duration(seconds: 3),
              content: Text("Image trop volumineuse")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Gallery Page'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            if (imageFile != null) Image.file(imageFile!, height: 900),
            SizedBox(height: 30),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FloatingActionButton(
                    onPressed: pickImage, child: Icon(Icons.image_search)),
                if (imageFile != null)
                  Padding(
                    padding: const EdgeInsets.only(left:50.0),
                    child: FloatingActionButton(
                      onPressed: () => Navigator.pop(context, imageFile),
                      child: Icon(Icons.done),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
