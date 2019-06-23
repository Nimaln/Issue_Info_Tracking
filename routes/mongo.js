const express = require('express');

let router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://MyMongoDBUser:MongoDB@mongodbtrial-clevk.mongodb.net/test?retryWrites=true/";
//var uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("trial").collection("markup");
  // perform actions on the collection object
  console.log('database connected');
  if(err){
      console.log(err)
  }

  //setting up the post router for mongoDB, fetched inside panel.js
  router.post('/inputdata',(req,res) => {

    var input = req.body;
    var value = input.val;
    var id = input._id;
    var category = input.category;
    
    collection.insertOne({_id:id, value:value, category:category},function(err,res){
        if(err) throw err;
        console.log('One value added');
    })
})

//setting up the get router for mongoDB, fetched inside panel.js

router.get('/readdatainfo',(req,res) => {

        collection.find({category:'Info'}).toArray(function(err,result){
        if(err) throw err;

        
        res.send(result);
    }); 
        
})

router.get('/readdataissue',(req,res) => {

    collection.find({category:'Issue'}).toArray(function(err,result){
    if(err) throw err;
    
    res.send(result);

    console.log('Issue comments found'); 
}); 
    
})


  //client.close();
});


module.exports = router