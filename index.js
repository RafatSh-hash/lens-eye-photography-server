// import and defining credentials for server

const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 1000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//Addding Middleware
app.use(cors());
app.use(express.json());

//connecting To MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5crvfi4.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//Authorizing User by JWT token
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
    if (error) {
      return res.status(403).send({ message: "Forbidden" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    //creating serviceCollection and reviewCollection
    const serviceCollection = client.db("lephoto").collection("services");
    const reviewCollection = client.db("lephoto").collection("reviews");

    //Posting JWT Token
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    });

    //Fetching limited Data for home page
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query).limit(3);
      const services = await cursor.toArray();
      res.send(services);
    });

    //finding a specific service
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    //Fetching All Of the services available
    app.get("/allservices", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query).limit(0);
      const allservices = await cursor.toArray();
      res.send(allservices);
    });

    //Finding specific service
    app.get("/allservices/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    //Adding service by POST Method
    app.post("/services", verifyJWT, async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

    //Adding Review to reviewCollection
    app.post("/usersreview", verifyJWT, async (req, res) => {
      const usersReview = req.body;
      const result = await reviewCollection.insertOne(usersReview);
      res.send(result);
    });

    //fetching specific reviews for User
    app.get("/reviews", verifyJWT, async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();

      res.send(reviews);
    });

    //Delete Reviews
    app.delete("/reviews/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });
    //Getting Specific Reviews
    app.get("/review/:id", (req, res) => {
      const id = req.params.id;
      console.log(id);
      const reviewCollection = client
        .db("lephoto")
        .collection("reviews")
        .find({ service: id })
        .toArray(function (err, result) {
          if (err) throw err;
          console.log(result);
          res.send(result);
        });
    });
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
