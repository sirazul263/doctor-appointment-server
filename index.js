const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs-extra");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("doctors"));
app.use(fileUpload());
const port = 5000;

const uri = `mongodb+srv://doctorsPortal:${process.env.DB_PASSWORD}@cluster0.itbuk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const appointmentCollection = client
    .db("doctorsPortal")
    .collection("appointment");
  const doctorsCollection = client.db("doctorsPortal").collection("doctors");

  app.get("/allAppointments", (req, res) => {
    appointmentCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addAppointment", (req, res) => {
    const appointment = req.body;
    appointmentCollection.insertOne(appointment).then((result) => {
      res.send(result);
    });
  });

  app.post("/isDoctor", (req, res) => {
    const email = req.body.email;
    doctorsCollection.find({ email: email }).toArray((err, doctors) => {
      res.send(doctors.length > 0);
    });
  });

  app.post("/appointmentByDate", (req, res) => {
    const date = req.body;
    const email = req.body.email;
    doctorsCollection.find({ email: email }).toArray((err, doctors) => {
      const filter = { date: date.date };
      if (doctors.length === 0) {
        appointmentCollection
          .find({ date: date.date, email: email })
          .toArray((err, documents) => {
            res.send(documents);
          });
      } else {
        appointmentCollection.find(filter).toArray((err, documents) => {
          res.send(documents);
        });
      }
    });
  });

  app.get("/doctors", (req, res) => {
    doctorsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addDoctor", (req, res) => {
    console.log("Receiving");
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const type = req.body.type;
    // const filePath = `${__dirname}/doctors/${file.name}`;
    // file.mv(filePath, (err) => {
    //   if (err) {
    //     console.log(err);
    //     return res.status(500).send({ msg: "Error " });
    //   }
    const fileImage = file.data;
    const encImg = fileImage.toString("base64");
    const image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, "base64"),
    };
    const doctor = { name, email, phone, type, image };
    doctorsCollection.insertOne(doctor).then((result) => {
      // fs.remove(filePath, (error) => {
      //   if (error) {
      //     console.log("Not uploaded");
      //   }
      res.send({ result: true });
      // });
    });
    // return res.send({ name: file.name, path: `/${file.name}` });
  });
  // });
});

app.get("/", (req, res) => {
  res.send("Hi");
});
app.listen(process.env.PORT || port);
