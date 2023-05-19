require("dotenv").config();
const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.p7e2eey.mongodb.net/?retryWrites=true&w=majority`;

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

// middleware
app.use(cors());
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyCollection = client.db("toyVerseDB").collection("toys");

    // get toys
    app.get("/toys", async (req, res) => {
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 20;
      const skip = page * limit;

      if (!req.query.toyName) {
        const cursor = toyCollection.find().skip(skip).limit(parseInt(limit));
        const result = await cursor.toArray();
        res.send(result);
      } else {
        const result = await toyCollection
          .find({toy_name: {$regex: req.query.toyName, $options: "i"}})
          .skip(skip)
          .limit(parseInt(limit))
          .toArray();
        res.send(result);
      }
    });

    // Total toys in my toys collection
    app.get("/total-toys", async (req, res) => {
      const result = await toyCollection.estimatedDocumentCount();
      res.send({totalToys: result});
    });

    // get myToys
    app.get("/my-toys", async (req, res) => {
      const sortField = req.query.sortField || "price";
      const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

      const sortOptions = {
        [sortField]: sortOrder,
      };
      let query = {};
      query = {email: req.query.email};

      if (req.query?.email && req.query?.sortOrder) {
        const result = await toyCollection
          .find(query)
          .sort(sortOptions)
          .toArray();
        res.send(result);
      } else if (req.query?.email) {
        const cursor = toyCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      } else {
        return res.send("Data not found!");
      }
    });

    // add a toy
    app.post("/toys", async (req, res) => {
      const toy = req.body;
      toy.price = parseInt(toy.price, 10);
      const result = await toyCollection.insertOne(toy);
      res.send(result);
    });

    // get a toy
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    // edit a toy
    app.patch("/toy/:id/edit", async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedToy = req.body;
      const {
        name,
        email,
        toy_name,
        price,
        rating,
        quantity,
        photo_url,
        description,
        categories,
      } = updatedToy;
      const updateDoc = {
        $set: {
          name,
          email,
          toy_name,
          price: parseInt(price),
          rating,
          quantity,
          photo_url,
          description,
          categories,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // delete a toy
    app.delete("/toy/:id/delete", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ping: 1});
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// route
app.get("/", (req, res) => {
  res.send("<h1>ToyVerse server side running!</h1>");
});

app.listen(PORT, () =>
  console.log(`Server is running port at on http://localhost:${PORT}`)
);
