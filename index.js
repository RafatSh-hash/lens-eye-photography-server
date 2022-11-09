const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 1000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5crvfi4.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.send({ message: "Unauthorized Access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
    if (error) {
      return res.send({ message: "Forbidden" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const serviceCollection = client.db("lephoto").collection("services");
    const reviewCollection = client.db("lephoto").collection("reviews");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "7d",
      });

      res.send({ token });
    });

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query).limit(3);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    app.get("/allservices", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query).limit(0);
      const allservices = await cursor.toArray();
      // console.log(allservices);
      res.send(allservices);
    });

    app.get("/allservices/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

    app.post("/usersreview", async (req, res) => {
      const usersReview = req.body;
      // console.log(usersReview);
      const result = await reviewCollection.insertOne(usersReview);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      let query = {};
      if (req.query.email) {
        // console.log(req.query.email);
        query = {
          email: req.query.email,
        };
      }
      const cursor = reviewCollection.find(query);

      const reviews = await cursor.toArray();

      res.send(reviews);
    });

    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    // app.get("/reviews/:id", (req, res) => {
    //   const id = req.reviews.serviceID;
    //   const reviewCollection = client
    //     .db("lephoto")
    //     .collection("reviews")
    //     .find({ serviceID: id })
    //     .toArray(function (err, result) {
    //       if (err) throw err;
    //       res.send(result);
    //     });

    // const id = req.params.id;
    // const query = { serviceName: "Wedding Photography" };
    // const reviews = await reviewCollection.findOne(query);
    // res.send(reviewCollection);
    //     let query = {};
    // res.send(query);
    // const cursor = reviewCollection.find(query);
    // const reviews = await cursor.toArray();
    // console.log(reviews[0], "-------------------");
    //   // res.send(reviews);
    // });
  } finally {
  }
}
run().catch((e) => console.log(e));

app.get("/", (req, res) => {
  res.send("Server running Successfully");
});

app.listen(port, () => {
  console.log(`Listening to ${port}`);
});
