const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.sbw5eqf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //data collection
    const dataCollection = client.db('brandShopDB').collection('data');
    const cartCollection = client.db('brandShopDB').collection('cart');

   
    app.get('/details/:id', async (req, res) => {
        const id = req.params.id;
        const query = ({ _id: new ObjectId(id) })
        const result = await dataCollection.findOne(query);
        res.send(result);
    })

  
    //create api for all cetagory data 
    app.get('/data/:id',async(req,res)=>{
        const brandName = req.params.id;
        console.log(brandName)
        const query = { brandName: brandName }  
        const cursor = dataCollection.find(query);
        const result = await cursor.toArray()
        res.send(result)
    })

    app.get('/data',async(req,res)=>{
        const query = dataCollection.find();

        const result = await query.toArray()
        res.send(result)
    })

    app.post('/carts',async(req,res)=>{
        const cartData = req.body;
        const result = await cartCollection.insertOne(cartData);
        res.send(result)
    })

    app.post('/data',async(req,res)=>{
        const data = req.body;
        const result = await dataCollection.insertOne(data)
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('BrandShop server is running')
})


app.listen(port,()=>{
    console.log(`BrandShop app listening on port ${port} `)
} )

