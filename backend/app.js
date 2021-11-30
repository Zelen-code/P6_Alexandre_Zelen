const express = require('express');
// creation of one Express application
const app = express();
const helmet = require('helmet');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config()

// the path module provides utilities for working with file and directory paths
const path = require('path');;

// declaration of roads

// import of the road dedicated to sauces
const sauceRoutes = require('./routes/sauce');

// import of the router
const userRoutes = require('./routes/user');



// connection to database
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ypbfk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));



// CORS
app.use((req, res, next) => {

    // allow to access to our API from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');

    // add headers mentioned to requests sent to our API
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');

    // send requests with mentioned methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(helmet());

// access to the body JSON of the request
app.use(express.json());

// indicates to Express that it needs to manage the resource "images" statically (sub folder : __dirname) each time it receives one request toward "/images" road
app.use('/images', express.static(path.join(__dirname, 'images')));

// record our router for all the requests toward /api/sauce
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

// make accessible from the other files of our project
module.exports = app;