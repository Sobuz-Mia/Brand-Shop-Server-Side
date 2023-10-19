const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
//BrandShop 
//l1e6UKxfVTqlWbMj
console.log(process.env.DB_Pass)

const uri = `mongodb+srv://BrandShop:l1e6UKxfVTqlWbMj@cluster0.sbw5eqf.mongodb.net/?retryWrites=true&w=majority`;

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
    const dataCollection = client.db('brandShopDB').collection('data');

    app.post('/data',async(req,res)=>{
        const data = req.body;
        const result = await dataCollection.insertOne(data)
        res.send(result)
    })

    app.get('/data',async(req,res)=>{
        const query = dataCollection.find();

        const result = await query.toArray()
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

