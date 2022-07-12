const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// const stuffRoutes = require('./routes/stuff');
// const userRoutes = require('./routes/user');

mongoose.connect('mongodb+srv://Solepsia:2UmVAJ2Mr5p0QXD1@spicycluster.cebu0.mongodb.net/?retryWrites=true&w=majority',
    { useNewUrlParser: true,
      useUnifiedTopology: true })
    .then(() => console.log('Connexion a MongoDB reussie !'))
    .catch(() => console.log('Connexion a MongoDB echouee !'));

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// app.use('/images', express.static(path.join(__dirname, 'images')));
// app.use('/api/stuff', stuffRoutes);
// app.use('/api/auth', userRoutes);

module.exports = app;

