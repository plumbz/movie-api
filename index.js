const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const express = require('express'),
         app = express();
    bodyParser= require('body-parser'),
    uuid = require('uuid');
    
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];
let auth = require('./auth')(app);

const { check, validationResult } = require('express-validator');

const cors = require('cors');
app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

mongoose.connect('mongodb://localhost:27017/myFlixDB', { 
  //useNewUrlParser: true, // deprecated
  //useUnifiedTopology: true // deprecated
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const passport = require('passport');
require('./passport');


//READ
// Get all users
app.get('/', (req, res) => {
    res.send('Welcome to my Movie API! <br> Go to /documentation.html to view the documentation.');
});



//Get all user
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const users = await Users.find();
    res.status(200).json(users);
} catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
}
});

//CREATE  Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('username', 'Username is required').isLength({min: 5}),
    check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail()
  ],  async (req, res) => {
    
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password);
    await Users.findOne({ username: req.body.username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.username + ' already exists');
        } else {
          Users
            .create({
              username: req.body.username,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              password: hashedPassword,
              email: req.body.email,
              birthday: req.body.birthday
            })
            .then((user) =>{res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
})
// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:username', passport.authenticate('jwt', { session: false }),
[
  check('username', 'Username is required').isLength({min: 5}),
  check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('password', 'Password is required').not().isEmpty(),
  check('email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
  // check the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.password);
  // CONDITION TO CHECK ADDED HERE
  if(req.user.username !== req.params.username){
      return res.status(400).send('Permission denied');
  }
  // CONDITION END
    await Users.findOneAndUpdate({ username: req.params.username }, {
       $set:
      {
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: hashedPassword,
        email: req.body.email,
        birthday: req.body.birthday
      }
    },
    { new: true }) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    })
})
// Delete a user by username
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await Users.findOneAndDelete({ username: req.params.username });
    
    if (!user) {
        return res.status(400).send(req.params.username + ' was not found');
    } else {
        return res.status(200).send(req.params.username + ' was deleted.');
    }
} catch (err) {
    console.error(err);
    return res.status(500).send('Error: ' + err);
}
});

// Add a movie to a user's list of favorites
app.post('/users/:username/favorites/:movieTitle',  passport.authenticate('jwt', { session: false }), async (req, res) => {
  // CONDITION TO CHECK ADDED HERE
  if(req.user.username !== req.params.username){
      return res.status(400).send('Permission denied');
  }

    try {
        // Find the user by username
        const user = await Users.findOne({ username: req.params.username });

        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        // Find the movie by title
        const movie = await Movies.findOne({ title: req.params.movieTitle });
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found!' });
        }

        // Add the movie ID to the user's favorites if it's not already there
        if (!user.favorites.includes(movie._id.toString())) {
            user.favorites.push(movie._id);
            await user.save(); // Save the updated user document
        }

        res.status(200).json({ message: 'Movie added to favorites!', favorites: user.favorites });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error: ' + error });
    }
})
// Delete a movie from a user's list of favorites
app.delete('/users/:username/favorites/:movieTitle', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { username, movieTitle } = req.params;
    // CONDITION TO CHECK ADDED HERE
  if(req.user.username !== req.params.username){
    return res.status(400).send('Permission denied');
  }
    try {
        // Find the user by username
        const user = await Users.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        // Find the movie by title
        const movie = await Movies.findOne({ title: movieTitle });

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found!' });
        }

        // Check if the movie ID is in the user's favorites array
        const movieId = movie._id.toString();
        if (!user.favorites.includes(movieId)) {
            return res.status(400).json({ message: 'Movie not found in favorites!' });
        }

        // Remove the movie ID from favorites
        user.favorites = user.favorites.filter(id => id !== movieId);

        // Save the updated user document
        await user.save();

        res.status(200).json({ message: `Movie '${movieTitle}' has been removed from ${username}'s favorites.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error: ' + error });
    }
})

//READ get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//READ  Get movie by title
app.get('/movies/:title',passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { title } = req.params;

    try {
        // Find the movie by title
        const movie = await Movies.findOne({ title: title });

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found!' });
        }

        res.status(200).json(movie);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error: ' + error });
    }
})

//READ get genre by name
app.get('/genres/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) =>{   
    const genreName = req.params.genreName;
    try {
        const movie = await Movies.findOne({ "genre.name": genreName });

        if (!movie) {
            return res.status(404).json({ message: `Genre '${genreName}' not found.` });
        }

        const genreDescription = movie.genre.description;

        res.status(200).json({ genre: genreName, description: genreDescription });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error: ' + err });
    }
})
//READ get director info by name
app.get('/directors/:directorName',passport.authenticate('jwt', { session: false }), async (req, res) =>{   
    const directorName = req.params.directorName;

    try {
        const movie = await Movies.findOne({ "director.name": directorName });
        
        if (!movie) {
            return res.status(404).json({ message: `Director '${directorName}' not found.` });
        }
        const directorBio = movie.director.bio;
        const directorBday =  movie.director.birthdate;
        const directorDday =  movie.director.deathdate;

        res.status(200).json({ director: directorName, 
            bio: directorBio,
            birthdate: directorBday, 
            deathdate: directorDday
        });
          
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error: ' + err });
    }
})

//Post
app.post('/movies', (req, res) =>{
    const newMovie = req.body;

    if (newMovie.title) {
        newMovie.id = uuid.v4();
        movies.push(newMovie);
        res.status(201).json(newMovie);
    } else {
        res.status(400).send( 'require title')
    }
})
//DELETE
app.delete('/movies/:title', (req, res) =>{
    const {title} = req.params;
    const movie = movies.find( movie => movie.Title === title );
 
    if (movie) {
        movies =  movies.filter(  movie => movie.Title != title);
        res.status(200).send(` movie ${title} has been deleted`);
    }  else {
         res.status(404).send('no such movie')
    }
})

app.use(express.static('public')); 

// listen for requests


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});

