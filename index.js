require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId, } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const app = express();
const port = process.env.PORT || 15000;


app.use(cors({
  origin:[
   " http://localhost:5173",
    "https://food-64053.web.app",
    "https://food-64053.firebaseapp.com",
    "https://foot-connect-95c3a.web.app" 
    

  ], 
   credentials:true
}));
app.use(express.json());
app.use(cookieParser());



const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.whg4qi0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//middlewares

const logger = async (req,res,next) =>{
  console.log('called:', req.host, req.originalUrl)
  // console.log('log: info', req.method, req.url)
  next()
}


const verifyToken = async(req,res,next) =>{
  const token = req.cookies?.token;
  console.log('value of token in middleware', token)
  if(!token) {
    return res.status(401).send({message: 'not authorized'})
  }

   jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    // error
    if(err){
      console.log(err)
      return res.status(401).send({message: 'unauthorized'})
      
    }
    
    // if token is valid then it would be decoded
    console.log('value in the token', decoded)
    req.user = decoded;
    next()
   })
  
}


const cookieOption ={
  httpOnly:true,
  sameSite:process.env.NODE_ENV === "production"?"none" :'strict',
  secure: process.env.NODE_ENV === "production"? true :false,
     
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

     const foodsCollection = client.db('foodsConnect').collection('foods');
   
     const bookingFoodCollection =client.db('foodsConnect').collection('bookingFood')
   

    //auth related api
   



app.post('/jwt'
  ,logger
  , async(req,res) =>{
  
  const user = req.body;
  console.log(user);
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,
     {expiresIn: '1h'})

  res.cookie('token', token,cookieOption).send({success: true});
// res.send(token)

})

app.post('/logout', async(req,res)=>{
  const user =req.body;
  console.log('logging out',user)
  res.clearCookie('token',{...cookieOption,maxAge:0}).send({success:true})
})


//services related api 

    app.get('/foods',logger,async(req,res) =>{
      
      const cursor = foodsCollection.find();
      const result = await cursor.toArray();
     
      res.send(result);
    })

    app.get('/foods/:id', async(req,res) =>{
      const id =req.params.id;
      const query = { _id: new ObjectId(id)}
      const options = {
        projection: {estate_title: 1,photoURL: 1, price: 1, service_id: 1,description:1,  image: 1, recipe: 1	 },
      };
      const result =await foodsCollection.findOne(query,options);
      res.send(result);
    })

  

      // bookings

  


    app.get('/bookingFood',verifyToken,logger,async(req, res) =>{
     console.log(req.query.email);
      // console.log('tok tok token',req.cookies.token)
      // console.log('tttt token',req.cookies.token)
      // console.log('user in the valid token',req.user)
      // console.log('cook cookies',req.cookies)
      if(req.user.email !== req.query.email){
        return res.status(403).send({message: 'forbidden access'})
      }
      let query = {};
      if (req.query?.email){
        query = { email:req.query.email}
      }

      // const cursor = bookingFoodCollection.find();
      // const result = await cursor.toArray();

      const result = await bookingFoodCollection.find().toArray();
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
    // await client.db("admin").command({ ping: 1 });
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
//require('crypto').randomBytes(64).toString('hex')