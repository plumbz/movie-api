const express = require('express');
const morgan = require('morgan');

const app = express();

let topMovies = [
    {
        title: 'Avengers: Endgame',
        director: 'Anthony Russo and Joe Russo',
        genre: 'Super Hero Movie'
    },
    {
        title: 'Princess Diary',
        director: 'Garry Marshall',
        genre : 'Comedy'
    },
    {
        title: 'Twilight',
        director: 'Catherine Hardwicke',
        genre: 'Romance'
    },
    {
        title: 'Braveheart',
        director: 'Mel Gibson',
        genre: 'Action'
    },
    {
        title: 'Gladiator',
        director: 'Ridley Scott',
        genre : 'Action'
    },
    {
        title: 'The Notebook',
        director: 'Nick Cassavetes',
        genre: 'Romance'
    },
    {
        title: 'Titanic',
        director: 'James Cameron',
        genre: 'Romance'
    },
    {
        title: 'Avatar',
        director: 'James Cameron',
        genre: 'Action'
    },
    {
        title: 'The Parent Trap',
        director: 'Nancy Meyers',
        genre : 'Comedy'
    },
    {
        title: 'The Age of Adaline',
        director: 'Lee Toland Krieger',
        genre: 'Romance'
    }
];

// setup the logger
app.use(morgan('combined'));

// GET requests
app.get('/', (req, res) => {
    res.send('Welcome to my Movie API! <br> Go to /documentation.html to view the documentation.');
});

app.use(express.static('public'));  

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});