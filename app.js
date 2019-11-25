const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const config = require('./config.json');
const auth = require('./middleware/auth.js');

const {buildSchema} = require('graphql');
const graphqlHttp = require('express-graphql');  // middleware function

const graphqlSchema = require('./schemas/index.js'); 
const graphqlResolvers = require('./resolvers/index.js'); 



const uri = config.mongoURI;
mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true});
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("mongoDB connected");
})


const app = express();


app.use(express.json());
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method === 'OPTIONS'){
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        return res.status(200).json({});
    }
    next(); 
  });
app.use(auth);





app.use('/graphql', graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,    // resolver functions
    graphiql: true 
}));




app.get('/test', (req, res) => {
    res.json({"bre": "bre"});
    

})


const port = process.env.PORT || 5001;
app.listen(port, () => console.log("running!!"));