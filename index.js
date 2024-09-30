const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const express = require('express'),
         app = express();
    bodyParser= require('body-parser'),
    uuid = require('uuid');

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
// let users = [
//      {
//         id: 1,        
//          name: "John",
//          favoriteMovies: []
//     },
//     {
//         id: 2,
//          name: "Kay",
//          favoriteMovies: ["Twilight"]
//     },
// ]
// let movies = [
//     {
//       Title: 'Twilight',
//       Discirption: 'When Bella Swan moves to a small town in the Pacific Northwest, she falls in love with Edward Cullen, a mysterious classmate who reveals himself to be a 108-year-old vampire.',
//       Director: {
//             Name: 'Catherine Hardwicke',
//             Bio: ('is an American film director, production designer, and screenwriter', 'October 21, 1955')
//         },
//         Genre:{
//             Name:'Romance',
//             Description: 'The romance genre is a category of literature, film, and other media that focuses on love and romantic relationships between characters as the central theme'
//         },
//       ImageUrl: 'https://en.wikipedia.org/wiki/Twilight_(2008_film)#/media/File:Twilight_(2008_film)_poster.jpg'
//     },
//     {
//         Title: 'Princess Diaries',
//         Description: 'Mia, a shy teen, discovers that she is the princess of a small European state. To be able to claim her right to the throne, she must groom herself and prove that she is indeed a princess.',
//         Director: {
//             Name:'Garry Marshall',
//             Bio: ('was an American screenwriter, film director, producer and actor.', 'November 13, 1934 - July 19, 2016')
//             },
//         Genre :{
//             Name:'Comedy',
//             Description:'Comedy is a genre of entertainment designed to amuse and entertain people through humor. It often involves situations, dialogue, and characters that provoke laughter or delight, focusing on lighter themes, misunderstandings, and exaggerations of everyday life.'
//         }, 
//         ImageUrl: 'https://en.wikipedia.org/wiki/The_Princess_Diaries_(film)#/media/File:Princess_diaries_ver1.jpg'
//     },
//     {
//         Title: 'Avengers: Endgame',
//         Description: 'After Thanos, an intergalactic warlord, disintegrates half of the universe, the Avengers must reunite and assemble again to reinvigorate their trounced allies and restore balance.',
//         Director: {
//             Name: 'Anthony Russo and Joe Russo',
//             Bio: ('are American directors, producers, and screenwriters','3. Februar 1970 and 18. Juli 1971')
//         },
//         Genre:{
//             Name:'Science fiction',
//             Description:'The science fiction (sci-fi) genre is a category of storytelling that explores imaginative and futuristic concepts based on scientific principles, technologies, and the potential consequences of their use.'
//         },
//         ImageUrl: 'https://en.wikipedia.org/wiki/Avengers:_Endgame#/media/File:Avengers_Endgame_poster.jpg'
//     },
//     {
//         Title: 'Braveheart',
//         Description: 'William Wallace, a Scottish rebel, along with his clan, sets out to battle King Edward I of England, who killed his bride a day after their marriage.',
//         Director: {
//             Name: 'Mel Gibson',
//             Bio:('is an American actor and filmmaker', ' January 3, 1956')
//         },
//        Genre:{
//             Name:'Action',
//             Description:'The action genre is a category of entertainment that focuses on fast-paced sequences, intense physical activities, and high-energy scenes.'
//         },
//         ImageUrl: 'https://en.wikipedia.org/wiki/Braveheart#/media/File:Braveheart_imp.jpg'
//     },
//     {
//         Title: 'Gladiator',
//         Discription: 'Commodus takes over power and demotes Maximus, one of the preferred generals of his father, Emperor Marcus Aurelius. As a result, Maximus is relegated to fighting till death as a gladiator.',
//         Director: {
//             Name: 'Ridley Scott',
//             Bio:('is an English filmmaker', 'November 30, 1937')
//         },
//         Genre :{
//             Name: 'Action',
//             Description: 'The action genre is a category of entertainment that focuses on fast-paced sequences, intense physical activities, and high-energy scenes.'
//         },
//         ImageUrl: 'https://en.wikipedia.org/wiki/Gladiator_(2000_film)#/media/File:Gladiator_(2000_film_poster).png'
//     },
//     {
//         Title: 'The Notebook',
//         Description: 'Noah, a poor man, falls in love with Allie who comes from wealth. They are forced to keep passion for each other aside due to societal pressure and a difference in the social stature of their families.',
//         Director: {
//             Name: 'Nick Cassavetes',
//             Bio: (' is an American actor, director, and writer', 'May 21, 1959')
//         },
//         Genre:{
//             Name: 'Romance',
//             Description: 'The romance genre is a category of literature, film, and other media that focuses on love and romantic relationships between characters as the central theme'
//         },
//         ImageUrl: 'https://en.wikipedia.org/wiki/The_Notebook#/media/File:Posternotebook.jpg'
//     },
//     {
//         Title: 'Titanic',
//         Description: 'Rose, who is being forced to marry a wealthy man, falls in love with Jack, a talented artist, aboard the unsinkable Titanic. Unfortunately, the ship hits an iceberg, endangering their lives.',
//         Director: {
//             Name: 'James Cameron',
//             Bio: ('is a Canadian filmmaker', 'August 16, 1954')
//         },
//         Genre: {
//             Name:'Romance',
//             Description: 'The romance genre is a category of literature, film, and other media that focuses on love and romantic relationships between characters as the central theme'
//         },
//         ImageUrl: 'https://en.wikipedia.org/wiki/Titanic_(1997_film)#/media/File:Titanic_(1997_film)_poster.png'
//     },
//     {
//         Title: 'Avatar',
//         Description:'Jake, a paraplegic marine, replaces his brother on the Na vi-inhabited Pandora for a corporate mission. He is accepted by the natives as one of their own, but he must decide where his loyalties lie.',
//          Director: {
//             Name: 'James Cameron',
//             Bio: ('is a Canadian filmmaker','August 16, 1954')
//         },
//         Genre:{
//             Name:'Science fiction',
//             Description:'The science fiction (sci-fi) genre is a category of storytelling that explores imaginative and futuristic concepts based on scientific principles, technologies, and the potential consequences of their use.'
//         },
//          ImageUrl: 'https://en.wikipedia.org/wiki/Avatar_(2009_film)#/media/File:Avatar_(2009_film)_poster.jpg'
//     },
//     {
//         Title: 'The Parent Trap',  
//         Description:'Identical twins Hallie and Annie are separated after their parents divorce. Years later, they discover each other at a summer camp and decide to switch places in an effort to reunite their parents',
//         Director:{
//             Name: 'Nancy Meyers',
//             Bio: (' is an American filmmaker', 'December 8, 1948')
//         },      
//         Genre : {
//             Name:'Comedy',
//             Description:'Comedy is a genre of entertainment designed to amuse and entertain people through humor. It often involves situations, dialogue, and characters that provoke laughter or delight, focusing on lighter themes, misunderstandings, and exaggerations of everyday life.'
//         },
//         ImageUrl:'https://en.wikipedia.org/wiki/The_Parent_Trap_(1998_film)#/media/File:Parenttrapposter.jpg'
//     },
//     {
//         Title: 'The Age of Adaline',
//         Description: 'Adaline, who has been 29 for eight decades, meets and madly falls in love with Ellis. She is forced to make a life-altering decision after a meeting with his parents threatens to expose her secret.',
//         Director: {
//             Name: 'Lee Toland Krieger',
//             Bio: ('is an American film director and screenwriter', 'January 24, 1983')
//         },
//         Genre:{
//             Name: 'Romance',
//             Description: 'The romance genre is a category of literature, film, and other media that focuses on love and romantic relationships between characters as the central theme'
//         },
//         ImageUrl: 'https://en.wikipedia.org/wiki/The_Age_of_Adaline#/media/File:The_Age_of_Adaline_film_poster.png'
//     }
// ];


//READ
// Get all users
app.get('/', (req, res) => {
    res.send('Welcome to my Movie API! <br> Go to /documentation.html to view the documentation.');
});

app.get('/users', async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
    })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
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
app.post('/users', async (req, res) => {
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
            password: req.body.password,
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
});

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
app.put('/users/:username', async (req, res) => {
    await Users.findOneAndUpdate({ username: req.params.username }, { $set:
      {
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password,
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
  
  });
// Add a movie to a user's list of favorites
app.post('/users/:username/movies/:MovieID', async (req, res) => {
    await Users.findOneAndUpdate({ username: req.params.username }, {
       $push: { favorites: req.params.MovieID }
     },
     { new: true }) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

// //DELETE
    app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been remove from user ${id}'s array`);
    } else {
        res.status(400).send( 'user cannot be found!');
    }
})

// Delete a user by username
app.delete('/users/:username', async (req, res) => {
    await Users.findOneAndDelete({ username: req.params.username }) // fineOneAndRemove did not work, but with findOneAndDelete did
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.username + ' was not found');
        } else {
          res.status(200).send(req.params.username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

//READ
app.get('/movies', async(req, res) =>{
    Movies.find().then(movies => res.json(movies));
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
});

//READ
app.get('/movies/:title', (req, res) =>{
   const {title} = req.params;
   const movie = movies.find( movie => movie.Title === title );

   if (movie) {
        res.status(200).json(movie);
    }  else {
        res.status(404).send('no such movie')
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

//READ
app.get('/genres/:genreName', async (req, res) =>{   
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

 //READ
 app.get('/directors/:directorName', async (req, res) =>{   
    const directorName = req.params.directorName;

    try {
        const movie = await Movies.findOne({ "director.name": directorName });
        
        if (!movie) {
            return res.status(404).json({ message: `Director '${directorName}' not found.` });
        }
        console.log(movie);
        console.log("this is a fency added log :");
        console.log( movie.genre.name);
        console.log("but the director is not working :");
        console.log( movie.director.name);
        // const directorBio = movie.director.bio;
       // const directorBday =  movie.director.birthdate;
       // const directorDday =  movie.director.deathdate;

        res.status(200).json({ director: directorName, 
            // bio: directorBio,
            // birthdate: directorBday, 
            // deathdate: directorDday
        });
          
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error: ' + err });
    }
});
app.use(express.static('public')); 

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
})