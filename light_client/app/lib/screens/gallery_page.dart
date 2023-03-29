import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:flutter/material.dart';

class GalleryPage extends StatefulWidget {
  final List iconList;
  const GalleryPage({super.key, required this.iconList});

  @override
  _GalleryPageState createState() => _GalleryPageState();
}

class _GalleryPageState extends State<GalleryPage> {
  File? imageFile;
  int index = -1;

  Future<void> pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      final file = File(pickedFile.path);
      final size = await file.length();
      if (size <= 50000) {
        setState(() {
          index = -1;
          imageFile = File(pickedFile.path);
        });
      } else {
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
        title: Text("Page de choix d'icône"),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            if (imageFile != null && imageFile?.path != '')
              Image.file(imageFile!, height: 900),
            if (index > -1) Image.memory(widget.iconList[index], height: 600),
            SizedBox(height: 30),
            if (imageFile == null)
              Column(
                children: [
                  Text(
                    'Choississez une icône ou importer une image',
                    style: TextStyle(
                        fontSize: 20.0,
                        fontWeight: FontWeight.w700,
                        color: Color.fromARGB(255, 4, 102, 115)),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 50, bottom: 250),
                    child: displayDefaultIcon(),
                  ),
                ],
              ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (imageFile != null || index > -1)
                  Padding(
                    padding: const EdgeInsets.only(right: 50.0),
                    child: FloatingActionButton(
                        onPressed: () {
                          setState(() {
                            imageFile = null;
                            index = -1;
                          });
                        },
                        child: Icon(Icons.close)),
                  ),
                FloatingActionButton(
                    onPressed: pickImage, child: Icon(Icons.image_search)),
                if (imageFile != null || index > -1)
                  Padding(
                    padding: const EdgeInsets.only(left: 50.0),
                    child: FloatingActionButton(
                      onPressed: () {
                        if(index >= 0){
                          imageFile = File("$index");
                        }
                        Navigator.pop(context, imageFile);
                      },
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

  displayDefaultIcon() {
    List<Widget> icons = [];
    setState(() {
      for (int i = 0; i < widget.iconList.length; i++) {
        icons.add(Hero(
          tag: "Hero$i",
          child: GestureDetector(
            onTap: () {
              setState(() {
                index = i;
                imageFile = File('');
                print(i);
              });
            },
            child: Container(
              padding: EdgeInsets.all(25),
              child: Image.memory(widget.iconList[i], height: 50, width: 50),
            ),
          ),
        ));
      }
    });

    List<Widget> rows = [];
    for (int i = 0; i < 3; i++) {
      List<Widget> columns = [];
      for (int j = 0; j < 7; j++) {
        int index = i + j * 3;
        if (index < icons.length) {
          columns.add(icons[index]);
        }
      }
      rows.add(Row(children: columns));
    }

    return Column(children: rows);
  }
}
