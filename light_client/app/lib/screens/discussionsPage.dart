import 'package:flutter/material.dart';
import 'package:app/widgets/conversationList.dart';

class Discussions extends StatefulWidget {
  const Discussions({super.key});

  @override
  State<Discussions> createState() => _DiscussionsState();
}

class _DiscussionsState extends State<Discussions> {
  List<String> discussions = ["General"];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        physics: BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            SafeArea(
              child: Padding(
                padding: EdgeInsets.only(left: 16, right: 16, top: 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: <Widget>[
                    Text(
                      "Conversations",
                      style:
                          TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                    )
                  ],
                ),
              ),
            ),
            ListView.separated(
                itemCount: discussions.length,
                shrinkWrap: true,
                padding: EdgeInsets.all(16),
                physics: BouncingScrollPhysics(),
                itemBuilder: (context, index) {
                  return ConversationList(
                    name: discussions[index],
                  );
                },
                separatorBuilder: (context, index) => SizedBox(
                      height: 10,
                    )),
          ],
        ),
      ),
    );
  }
}
