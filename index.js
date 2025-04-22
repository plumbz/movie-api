/**
 * @fileOverview A simple Movie API built using Node.js, Express, and MongoDB (via Mongoose).
 * @requires express
 * @requires mongoose
 * @requires body-parser
 * @requires uuid
 * @requires express-validator
 * @requires cors
 * @requires passport
 */

const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

const express = require('express'),
  app = express();
const bodyParser = require('body-parser'),
  uuid = require('uuid');

const { check, validationResult } = require('express-validator');

const cors = require('cors');

/**
 * List of allowed origins for CORS
 * @type {Array<string>}
 */
let allowedOrigins = [
  'http://localhost:8080',
  'http://testsite.com',
  'http://localhost:1234',
  'https://my-testflix.netlify.app',
  'https://plumbz.github.io'
];

/**
 * Middleware to enable CORS for whitelisted origins.
 */
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

/**
 * Connect to MongoDB using Mongoose.
 * The connection URI is read from environment variables for security.
 */
mongoose.connect(process.env.CONNECTION_URI, {});

/**
 * Middleware to parse incoming requests with JSON payloads.
 */
app.use(bodyParser.json());

/**
 * Middleware to parse URL-encoded data.
 * @param {Object} options - Options to control parsing behavior
 */
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Passport authentication module.
 * Initializes authentication strategies for the application.
 */
const passport = require('passport');
let auth = require('./auth')(app);

/**
 * @route GET /
 * @group Welcome - Default entry route
 * @returns {string} 200 - Welcome message
 * @returns {Error}  default - Unexpected error
 * @example response - 200 - Success
 * "Welcome to my Movie API! Go to /documentation.html to view the documentation."
 */
app.get('/', (req, res) => {
  res.send('Welcome to my Movie API! <br> Go to /documentation.html to view the documentation.');
});


/**
 * @route GET /users
 * @group Users - Operations related to user accounts
 * @security JWT
 * @summary Get all users
 * @description Returns a list of all registered users. This route is protected and requires a valid JWT.
 * @returns {Array<Object>} 200 - An array of user objects
 * @returns {Error} 500 - Internal server error
 * 
 * @example request - Example JWT protected request
 * GET /users
 * Authorization: Bearer <your_token_here>
 * 
 * @example response - 200 - Success
 * [
 *   {
 *     "_id": "60e5f9aeb4d6a611d8b0c712",
 *     "Username": "johndoe",
 *     "Email": "john@example.com",
 *     "Birthday": "1990-01-01T00:00:00.000Z",
 *     "FavoriteMovies": []
 *   },
 *   ...
 * ]
 */
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const users = await Users.find();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

/**
 * @route GET /users/:username
 * @middleware passport.authenticate('jwt')
 * @description Retrieves a user by their username.
 * 
 * @param req - The Express request object, containing the `username` parameter.
 * @param res - The Express response object used to send back the desired HTTP response.
 * 
 * @returns {200} Returns the user object if found.
 * @returns {404} Returns an error message if the user is not found.
 * @returns {500} Returns a server error message if something goes wrong during the process.
 */
app.get(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { username } = req.params;

    try {
      // Find the user by username
      const user = await Users.findOne({ username: username });
      if (!user) {
        return res.status(404).json({ message: 'User not found!' });
      }
      res.status(200).json(user);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);


/**
 * @route POST /users
 * @group Users - Operations related to user accounts
 * @summary Register a new user
 * @description This endpoint registers a new user with the application. The user must provide a unique username, a valid email, and a password.
 *              Input is validated for minimum length and format. Passwords are hashed before storage.
 * @param {Object} req.body - The user details
 * @param {string} req.body.username - The username (must be alphanumeric and at least 5 characters)
 * @param {string} req.body.password - The password (required)
 * @param {string} req.body.email - The user's email (must be valid)
 * @param {string} [req.body.firstName] - The user's first name (optional)
 * @param {string} [req.body.lastName] - The user's last name (optional)
 * @param {string} [req.body.birthday] - The user's birthday (optional, in ISO format)
 * 
 * @returns {Object} 201 - Successfully created user object
 * @returns {Object} 400 - Username already exists
 * @returns {Object} 422 - Validation errors
 * @returns {Error} 500 - Internal server error
 *
 * @example request - example registration input
 * {
 *   "username": "janedoe",
 *   "password": "securePassword123",
 *   "email": "jane@example.com",
 *   "firstName": "Jane",
 *   "lastName": "Doe",
 *   "birthday": "1995-04-10"
 * }
 *
 * @example response - 201 - Created
 * {
 *   "_id": "609dcd9c9e1b8b0015b708c4",
 *   "username": "janedoe",
 *   "firstName": "Jane",
 *   "lastName": "Doe",
 *   "email": "jane@example.com",
 *   "birthday": "1995-04-10T00:00:00.000Z",
 *   "FavoriteMovies": []
 * }
 */
app.post('/users',
  [
    check('username', 'Username is required').isLength({ min: 5 }),
    check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail()
  ], async (req, res) => {

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
            .then((user) => { res.status(201).json(user) })
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
  });


/**
 * @route PUT /users/{username}
 * @group Users - Operations related to user accounts
 * @security JWT
 * @summary Update user information
 * @description Allows an authenticated user to update their own account information. 
 *              The user must match the username in the route to make changes. 
 *              Input is validated, and the password is hashed before storing.
 *
 * @param {string} username.path.required - Username of the user to update
 * @param {Object} req.body - User details to update
 * @param {string} req.body.username - New username (must be alphanumeric, min 5 characters)
 * @param {string} req.body.password - New password (required)
 * @param {string} req.body.email - New email (must be valid)
 * @param {string} [req.body.firstName] - Updated first name (optional)
 * @param {string} [req.body.lastName] - Updated last name (optional)
 * @param {string} [req.body.birthday] - Updated birthday (optional, ISO 8601 format)
 * 
 * @returns {Object} 200 - Updated user object
 * @returns {Object} 400 - Permission denied (username mismatch)
 * @returns {Object} 422 - Validation errors
 * @returns {Error} 500 - Internal server error
 *
 * @example request - Example update input
 * {
 *   "username": "janedoeUpdated",
 *   "password": "newSecurePassword123",
 *   "email": "jane.updated@example.com",
 *   "firstName": "Jane",
 *   "lastName": "Doe",
 *   "birthday": "1995-04-10"
 * }
 *
 * @example response - 200 - Success
 * {
 *   "_id": "609dcd9c9e1b8b0015b708c4",
 *   "username": "janedoeUpdated",
 *   "firstName": "Jane",
 *   "lastName": "Doe",
 *   "email": "jane.updated@example.com",
 *   "birthday": "1995-04-10T00:00:00.000Z",
 *   "FavoriteMovies": []
 * }
 */
app.put('/users/:username', passport.authenticate('jwt', { session: false }),
  [
    check('username', 'Username is required').isLength({ min: 5 }),
    check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail()
  ], async (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password);

    if (req.user.username !== req.params.username) {
      return res.status(400).send('Permission denied');
    }

    await Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $set: {
          username: req.body.username,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          password: hashedPassword,
          email: req.body.email,
          birthday: req.body.birthday
        }
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      }
      );
  }
);



/**
 * @route DELETE /users/{username}
 * @group Users - Operations related to user accounts
 * @security JWT
 * @summary Deregister a user
 * @description Deletes a user account by username. The request must be authenticated with a valid JWT.
 *
 * @param {string} username.path.required - Username of the user to delete
 * 
 * @returns {string} 200 - Confirmation message that the user was deleted
 * @returns {string} 400 - User not found
 * @returns {Error} 500 - Internal server error
 *
 * @example request - Authenticated deletion
 * DELETE /users/janedoe
 * Authorization: Bearer <your_token_here>
 *
 * @example response - 200 - Success
 * "janedoe was deleted."
 *
 * @example response - 400 - User not found
 * "janedoe was not found"
 */
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



/**
 * @route POST /users/{username}/favorites/{movieTitle}
 * @group Users - Operations related to user accounts
 * @security JWT
 * @summary Add a movie to a user's favorites
 * @description This endpoint allows a user to add a movie to their favorites list. The request is protected by JWT, 
 *              and the user can only add movies to their own favorites list (based on username).
 *              If the movie is already in the user's favorites, it won't be added again.
 *
 * @param {string} username.path.required - The username of the user whose favorites list is being updated
 * @param {string} movieTitle.path.required - The title of the movie to add to the favorites list
 * 
 * @returns {Object} 200 - Success message with the updated list of favorite movie IDs
 * @returns {Object} 400 - Permission denied (username mismatch)
 * @returns {Object} 404 - User or movie not found
 * @returns {Error} 500 - Internal server error
 *
 * @example request - Example movie added to favorites
 * POST /users/janedoe/favorites/Inception
 * Authorization: Bearer <your_token_here>
 *
 * @example response - 200 - Movie added to favorites
 * {
 *   "message": "Movie added to favorites!",
 *   "favorites": ["605c72ef1532071d7c0bb1a0", "605c72ef1532071d7c0bb1a1"]
 * }
 *
 * @example response - 400 - Permission denied
 * "Permission denied"
 *
 * @example response - 404 - User not found
 * {
 *   "message": "User not found!"
 * }
 *
 * @example response - 404 - Movie not found
 * {
 *   "message": "Movie not found!"
 * }
 */
app.post('/users/:username/favorites/:movieTitle', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // Check if the username in the token matches the username in the route params
  if (req.user.username !== req.params.username) {
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
});

/**
 * @route DELETE /users/{username}/favorites/{movieTitle}
 * @group Users - Operations related to user accounts
 * @security JWT
 * @summary Remove a movie from a user's favorites
 * @description This endpoint allows an authenticated user to remove a movie from their favorites list. 
 *              The user can only remove movies from their own favorites list (based on username).
 *              If the movie is not in the user's favorites, a 400 error is returned.
 *
 * @param {string} username.path.required - The username of the user whose favorites list is being updated
 * @param {string} movieTitle.path.required - The title of the movie to remove from the favorites list
 * 
 * @returns {Object} 200 - Success message with confirmation that the movie was removed
 * @returns {Object} 400 - Movie not found in favorites
 * @returns {Object} 400 - Permission denied (username mismatch)
 * @returns {Object} 404 - User or movie not found
 * @returns {Error} 500 - Internal server error
 *
 * @example request - Example remove movie from favorites
 * DELETE /users/janedoe/favorites/Inception
 * Authorization: Bearer <your_token_here>
 *
 * @example response - 200 - Movie removed from favorites
 * {
 *   "message": "Movie 'Inception' has been removed from janedoe's favorites."
 * }
 *
 * @example response - 400 - Movie not found in favorites
 * {
 *   "message": "Movie not found in favorites!"
 * }
 *
 * @example response - 400 - Permission denied
 * "Permission denied"
 *
 * @example response - 404 - User not found
 * {
 *   "message": "User not found!"
 * }
 *
 * @example response - 404 - Movie not found
 * {
 *   "message": "Movie not found!"
 * }
 */
app.delete('/users/:username/favorites/:movieTitle', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { username, movieTitle } = req.params;
  // Check if the username in the token matches the username in the route params
  if (req.user.username !== req.params.username) {
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
    user.favorites.pull(movie._id);  // This removes the movie from the array by its ObjectId

    // Save the updated user document
    await user.save();

    res.status(200).json({ message: `Movie '${movieTitle}' has been removed from ${username}'s favorites.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error: ' + error });
  }
});

/**
 * @route GET /movies
 * @group Movies - Operations related to movie listings
 * @security JWT
 * @summary Get all movies
 * @description This endpoint returns a list of all movies in the database. It is protected by JWT authentication.
 *
 * @returns {Array} 200 - A list of all movie objects
 * @returns {Error} 500 - Internal server error
 *
 * @example request - Get all movies
 * GET /movies
 * Authorization: Bearer <your_token_here>
 *
 * @example response - 200 - Success
 * [
 *   {
 *     "_id": "605c72ef1532071d7c0bb1a0",
 *     "title": "Inception",
 *     "director": "Christopher Nolan",
 *     "year": 2010,
 *     "rating": 8.8,
 *     "genre": "Sci-Fi",
 *     "description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
 *     "imageUrl": "https://image-url.com",
 *     "imageDescription": "Inception movie poster"
 *   },
 *   {
 *     "_id": "605c72ef1532071d7c0bb1a1",
 *     "title": "The Dark Knight",
 *     "director": "Christopher Nolan",
 *     "year": 2008,
 *     "rating": 9.0,
 *     "genre": "Action",
 *     "description": "When the menace known as The Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.",
 *     "imageUrl": "https://image-url.com",
 *     "imageDescription": "The Dark Knight movie poster"
 *   }
 * ]
 *
 * @example response - 500 - Server error
 * "Error: Server error: <error details>"
 */
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


/**
 * @route GET /movies/{title}
 * @group Movies - Operations related to movie listings
 * @security JWT
 * @summary Get a movie by its title
 * @description This endpoint returns a movie based on its title. It is protected by JWT authentication.
 *              If the movie is not found, a 404 error is returned.
 *
 * @param {string} title.path.required - The title of the movie to retrieve
 * 
 * @returns {Object} 200 - A movie object with details
 * @returns {Object} 404 - Movie not found
 * @returns {Error} 500 - Internal server error
 *
 * @example request - Get a movie by title
 * GET /movies/Inception
 * Authorization: Bearer <your_token_here>
 *
 * @example response - 200 - Movie details
 * {
 *   "_id": "605c72ef1532071d7c0bb1a0",
 *   "title": "Inception",
 *   "director": "Christopher Nolan",
 *   "year": 2010,
 *   "rating": 8.8,
 *   "genre": "Sci-Fi",
 *   "description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
 *   "imageUrl": "https://image-url.com",
 *   "imageDescription": "Inception movie poster"
 * }
 *
 * @example response - 404 - Movie not found
 * {
 *   "message": "Movie not found!"
 * }
 *
 * @example response - 500 - Server error
 * "Server error: <error details>"
 */
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
});

/**
 * @route GET /genres/{genreName}
 * @group Genres - Operations related to movie genres
 * @security JWT
 * @summary Get genre by name
 * @description This endpoint returns a movie genre by its name along with its description. 
 *              It is protected by JWT authentication. If the genre is not found, a 404 error is returned.
 *
 * @param {string} genreName.path.required - The name of the genre to retrieve
 * 
 * @returns {Object} 200 - Genre name and description
 * @returns {Object} 404 - Genre not found
 * @returns {Error} 500 - Internal server error
 *
 * @example request - Get genre by name
 * GET /genres/Sci-Fi
 * Authorization: Bearer <your_token_here>
 *
 * @example response - 200 - Genre details
 * {
 *   "genre": "Sci-Fi",
 *   "description": "Science fiction is a genre that often explores futuristic concepts such as space travel, time travel, and advanced technology."
 * }
 *
 * @example response - 404 - Genre not found
 * {
 *   "message": "Genre 'Sci-Fi' not found."
 * }
 *
 * @example response - 500 - Server error
 * "Server error: <error details>"
 */
app.get('/genres/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
});
/**
 * @route GET /directors/{directorName}
 * @group Directors - Operations related to movie directors
 * @security JWT
 * @summary Get director information by name
 * @description This endpoint returns information about a director, including their bio, birthdate, and deathdate, based on the director's name. 
 *              It is protected by JWT authentication. If the director is not found, a 404 error is returned.
 *
 * @param {string} directorName.path.required - The name of the director to retrieve information for
 * 
 * @returns {Object} 200 - Director information (bio, birthdate, deathdate)
 * @returns {Object} 404 - Director not found
 * @returns {Error} 500 - Internal server error
 *
 * @example request - Get director info by name
 * GET /directors/Christopher%20Nolan
 * Authorization: Bearer <your_token_here>
 *
 * @example response - 200 - Director info
 * {
 *   "director": "Christopher Nolan",
 *   "bio": "Christopher Nolan is a British-American director known for his films such as 'Inception', 'The Dark Knight Trilogy', and 'Interstellar'.",
 *   "birthdate": "1970-07-30",
 *   "deathdate": null
 * }
 *
 * @example response - 404 - Director not found
 * {
 *   "message": "Director 'Christopher Nolan' not found."
 * }
 *
 * @example response - 500 - Server error
 * "Server error: <error details>"
 */
app.get('/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const directorName = req.params.directorName;

  try {
    const movie = await Movies.findOne({ "director.name": directorName });

    if (!movie) {
      return res.status(404).json({ message: `Director '${directorName}' not found.` });
    }
    const directorBio = movie.director.bio;
    const directorBday = movie.director.birthdate;
    const directorDday = movie.director.deathdate;

    res.status(200).json({
      director: directorName,
      bio: directorBio,
      birthdate: directorBday,
      deathdate: directorDday
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error: ' + err });
  }
});

/**
 * @route POST /movies
 * @group Movies - Operations related to movie listings
 * @summary Add a new movie
 * @description This endpoint allows the addition of a new movie to the collection. The request body should include a `title`. 
 *              If the `title` is not provided, a 400 error is returned.
 *
 * @param {Movie} movie.body.required - The movie object to be added, must include a `title`.
 * @param {string} movie.title.body.required - The title of the movie to be added
 * @param {string} movie.director.body.optional - The director of the movie
 * @param {number} movie.year.body.optional - The release year of the movie
 * @param {number} movie.rating.body.optional - The movie's rating
 * @param {string} movie.genre.body.optional - The genre of the movie
 * @param {string} movie.description.body.optional - A brief description of the movie
 * @param {string} movie.imageUrl.body.optional - URL of the movie poster image
 * @param {string} movie.imageDescription.body.optional - Description of the movie poster image
 * 
 * @returns {Object} 201 - The newly added movie
 * @returns {Error} 400 - Missing `title` in request body
 *
 * @example request - Add a new movie
 * POST /movies
 * {
 *   "title": "Inception",
 *   "director": "Christopher Nolan",
 *   "year": 2010,
 *   "rating": 8.8,
 *   "genre": "Sci-Fi",
 *   "description": "A thief who steals corporate secrets through the use of dream-sharing technology...",
 *   "imageUrl": "https://example.com/inception.jpg",
 *   "imageDescription": "Inception movie poster"
 * }
 *
 * @example response - 201 - Movie added successfully
 * {
 *   "title": "Inception",
 *   "director": "Christopher Nolan",
 *   "year": 2010,
 *   "rating": 8.8,
 *   "genre": "Sci-Fi",
 *   "description": "A thief who steals corporate secrets through the use of dream-sharing technology...",
 *   "imageUrl": "https://example.com/inception.jpg",
 *   "imageDescription": "Inception movie poster",
 *   "id": "uuid-v4-generated-id"
 * }
 *
 * @example response - 400 - Missing `title` in request body
 * "require title"
 */
app.post('/movies', (req, res) => {
  const newMovie = req.body;

  if (newMovie.title) {
    newMovie.id = uuid.v4();
    movies.push(newMovie);
    res.status(201).json(newMovie);
  } else {
    res.status(400).send('require title');
  }
});
/**
 * @route DELETE /movies/{title}
 * @group Movies - Operations related to movie listings
 * @summary Delete a movie by title
 * @description This endpoint allows users to delete a movie from the collection by its title. 
 *              If the movie is found, it is deleted, and a success message is returned.
 *              If the movie is not found, a 404 error is returned.
 *
 * @param {string} title.path.required - The title of the movie to be deleted
 * 
 * @returns {string} 200 - Success message indicating the movie has been deleted
 * @returns {Error} 404 - Movie not found
 *
 * @example request - Delete a movie by title
 * DELETE /movies/Inception
 *
 * @example response - 200 - Movie deleted successfully
 * "movie Inception has been deleted"
 *
 * @example response - 404 - Movie not found
 * "no such movie"
 */
app.delete('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find(movie => movie.Title === title);

  if (movie) {
    movies = movies.filter(movie => movie.Title != title);
    res.status(200).send(` movie ${title} has been deleted`);
  } else {
    res.status(404).send('no such movie');
  }
});

/**
 * @description This is the server setup for the Movie API. The server serves static files from the 'public' directory and listens for incoming HTTP requests on a specified port.
 * The server will listen on port 8080 by default or a port defined by the `PORT` environment variable.
 *
 * @example request - Start the server
 * The server listens for HTTP requests on the specified port.
 * 
 * @example response - Server logs in the console
 * "Listening on Port 8080"
 */
app.use(express.static('public'));

// Listen for requests on the specified port
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
