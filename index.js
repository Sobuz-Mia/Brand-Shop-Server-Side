const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true
}));
app.use(express.json());
app.use(cookieParser())



// vercel link
// https://brandshop-server-side-jygvx8slj-sobuzs-projects.vercel.app

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.sbw5eqf.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// verify cookies

const tokenVerify = async (req,res,next) =>{
  const token = req.cookies?.accessToken;
  if(!token){
    res.status(401).send({message:'Unauthorized'})
    return
  }
  jwt.verify(token,process.env.ACCESS_TOKEN,(error,decoded)=>{
    if(error){
      return res.status(402).send({message:'Forbidden'})
    }
    req.user = decoded;
    next();
  })
  
}
// const verify = async (req, res, next) => {
//   const token = req.cookies?.accessToken;
//   if (!token) {
//     return res.status(401).send({ message: "Unauthorized" });
//   }
//   jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {
//     if (error) {
//       console.log(error);
//       return res.status(401).send({ message: "forbidden" });
//     }
//     req.user = decoded;
//     next();
//   });
// };
async function run() {
  try {
    // await client.connect();

    const dataCollection = client.db("brandShopDB").collection("data");
    const cartCollection = client.db("brandShopDB").collection("cart");

    // jsonwebtoken start here

    app.post('/jwt',async(req,res)=>{
      const user = req.body;
      const token = jwt.sign(user,process.env.ACCESS_TOKEN,{expiresIn:'1h'})
      res
      .cookie('accessToken',token,{
        httpOnly:true,
        secure:false
      })
      .send({status:'success'})
    })

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

    app.get("/data",async (req, res) => {
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
          rating: rating,
        },
      };
      const result = await dataCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/carts/:email",tokenVerify,  async (req, res) => {
      const email = req.params.email;
      if(req.params.email !== req.user?.email){
        return res.status(403).send({message:'forbidden'})
      }
      // console.log(req.user.email);
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
  } 
}

run().catch(console.error);

app.get("/", (req, res) => {
  res.send("BrandShop server is running");
});

app.listen(port, () => {
  console.log(`BrandShop app listening on port ${port}`);
});
