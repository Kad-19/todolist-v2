//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:Hc8r8hjtLGtbZysM@cluster0.4izo2.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);
const task1 = new Item({
  name: "wake up",
});
const task2 = new Item({
  name: "Work",
});
const task3 = new Item({
  name: "Sleep",
});

const defaultItems = [task1, task2, task3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  const day = "Today";
  Item.find().then((items) => {
    if (items.length === 0) {
      Item.insertMany(defaultItems).then((items) => console.log(items));
      res.redirect("/");
    } else {
      res.render("list", { listTitle: day, newListItems: items });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const day = date.getDate();
  const item = new Item({
    name: itemName,
  });

  if (listName == "Today") {
    item.save().then((response) => console.log(response));
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then((response) => {
        if (response) {
          response.items.push(item);
          response.save();
        }

        res.redirect("/" + listName);
      })
      .catch((err) => console.log(err));
  }
});

app.post("/delete", (req, res) => {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName == "Today") {
    Item.findByIdAndDelete({ _id: itemId }).then((response) =>
      console.log(response)
    );
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: itemId } } }
    )
      .then((response) => {
        console.log(response);
        res.redirect("/" + listName);
      })
      .catch((err) => console.log(err));
  }
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then((response) => {
      if (!response) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: response.name,
          newListItems: response.items,
        });
      }
    })
    .catch((err) => console.log(err));
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
