require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId, } = require('mongodb');

const app = express();
const port = process.env.PORT || 15000;

app.use(cors({
  origin:[
    'http://localhost:5173'
  ],
   credentials:true
}));
app.use(express.json());


const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.whg4qi0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    //  const foodsCollection = client.db('foodsConnect').collection('foods');
     const foodCollection = client.db('foodsConnect').collection('food');
     const bookingFoodCollection =client.db('foodsConnect').collection('bookingFood')
    //  console.log(foodCollection)
    //  const bookingCollection = client.db('foodsConnect').collection('bookings');
    //  console.log(bookingCollection)

    app.get('/food',async(req,res) =>{
      
      const cursor = foodCollection.find();
      const result = await cursor.toArray();
     
      res.send(result);
    })

    app.get('/food/:id', async(req,res) =>{
      const id =req.params.id;
      const query = { _id: new ObjectId(id)}
      const options = {
        projection: {estate_title: 1,photoURL: 1, price: 1, service_id: 1,description:1,  image: 1, 	 },
      };
      const result =await foodCollection.findOne(query,options);
      res.send(result);
    })

      // bookings

    app.get('/bookingFood',async(req, res) =>{
     console.log(req.query.email);
      // console.log('tok tok token',req.cookies.token)
      // console.log('tttt token',req.cookies.token)
      // console.log('user in the valid token',req.user)
      // console.log('cook cookies',req.cookies)
      // if(req.user.email !== req.query.email){
      //   return res.status(403).send({message: 'forbidden access'})
      // }
      let query = {};
      if (req.query?.email){
        query = { email:req.query.email}
      }

      const cursor = bookingFoodCollection.find();
      const result = await cursor.toArray();

      // const result = await bookingCollection.find().toArray();
      res.send(result);


    })

     app.post('/bookingFood', async(req,res) =>{
      const booking = req.body;
      console.log(booking);
      const result = await bookingFoodCollection.insertOne(booking);
      res.send(result)
    } );

     app.patch('/bookingFood/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id)};
      const updatedBooking = req.body;
      console.log(updatedBooking);
      const updateDoc = {
        $set:{
          status: updatedBooking.status
        },
       
       
      }
      const result = await bookingFoodCollection.updateOne(filter,updateDoc)
      res.send(result)
    })


    app.delete('/bookingFood/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await bookingFoodCollection.deleteOne(query);
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

/////////////////////////


app.get('/',(req,res) =>{
      res.send('server is running')
})

app.listen(port, () =>{
      console.log(`server is running on port:${port}`)
})
