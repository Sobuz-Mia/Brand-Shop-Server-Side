const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// const corsConfig = {
//   origin: '*',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE']
//   }
  app.use(cors())
app.use(express.json());


const uri =` mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.sbw5eqf.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

const dataCollection = client.db("brandShopDB").collection("data");
    const cartCollection = client.db("brandShopDB").collection("cart");

    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await dataCollection.findOne(query);
      res.send(result);
    });

    //create api for all cetagory data
    app.get("/data/:id", async (req, res) => {
      const brandName = req.params.id;
      const query = { brandName: brandName };
      const cursor = dataCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/data", async (req, res) => {
      const query = dataCollection.find();

      const result = await query.toArray();
      res.send(result);
    });
    //cart collection start
    app.get("/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await dataCollection.findOne(query);
      res.send(result);
    });

    app.put("/updateCart/:id", async (req, res) => {
      const id = req.params.id;
      const {
        brandName,
        description,
        name,
        photo,
        price,
        rating,
        selectedOption,
      } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          name: name,
          description: description,
          photo: photo,
          price: price,
          selectedOption: selectedOption,
          brandName: brandName,
          rating: rating
        },
      };
      const result = await dataCollection.updateOne(
        filter,
        updateDoc,
      );
      res.send(result);
    });

    app.get("/carts/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/carts", async (req, res) => {
      const cartData = req.body;
      const result = await cartCollection.insertOne(cartData);
      res.send(result);
    });

    app.post("/data", async (req, res) => {
      const data = req.body;
      const result = await dataCollection.insertOne(data);
      res.send(result);
    });
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("Error: " + error.message);
  } finally {
    // Ensure that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.error);

app.get("/", (req, res) => {
  res.send("BrandShop server is running");
});

app.listen(port, () => {
  console.log(`BrandShop app listening on port ${port}`);
});
