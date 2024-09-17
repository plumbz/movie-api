const express = require('express'),
         app = express();
    bodyParser= require('body-parser'),
    uuid = require('uuid');

app.use(bodyParser.json());
let users = [
     {
        id: 1,        
         name: "John",
         favoriteMovies: []
    },
    {
        id: 2,
         name: "Kay",
         favoriteMovies: ["Twilight"]
    },
]
let movies = [
    {
      Title: 'Twilight',
      Discirption: 'When Bella Swan moves to a small town in the Pacific Northwest, she falls in love with Edward Cullen, a mysterious classmate who reveals himself to be a 108-year-old vampire.',
      Director: {
            Name: 'Catherine Hardwicke',
            Birthdate: 'October 21, 1955',
        },
        Genre:{
            Name:'Romance',
            Description: 'The romance genre is a category of literature, film, and other media that focuses on love and romantic relationships between characters as the central theme'
        },
      ImageUrl: 'https://en.wikipedia.org/wiki/Twilight_(2008_film)#/media/File:Twilight_(2008_film)_poster.jpg'
    },
    {
        Title: 'Princess Diaries',
        Description: 'Mia, a shy teen, discovers that she is the princess of a small European state. To be able to claim her right to the throne, she must groom herself and prove that she is indeed a princess.',
        Director: {
            Name:'Garry Marshall',
            Birthdate: 'November 13, 1934'
            },
        Genre :{
            Name:'Comedy',
            Description:'Comedy is a genre of entertainment designed to amuse and entertain people through humor. It often involves situations, dialogue, and characters that provoke laughter or delight, focusing on lighter themes, misunderstandings, and exaggerations of everyday life.'
        }, 
        ImageUrl: 'https://en.wikipedia.org/wiki/The_Princess_Diaries_(film)#/media/File:Princess_diaries_ver1.jpg'
    },
    {
        Title: 'Avengers: Endgame',
        Description: 'After Thanos, an intergalactic warlord, disintegrates half of the universe, the Avengers must reunite and assemble again to reinvigorate their trounced allies and restore balance.',
        Director: {
            Name: 'Anthony Russo and Joe Russo',
            Birthdate: '3. Februar 1970 and 18. Juli 1971'
        },
        Genre:{
            Name:'Science fiction',
            Description:'The science fiction (sci-fi) genre is a category of storytelling that explores imaginative and futuristic concepts based on scientific principles, technologies, and the potential consequences of their use.'
        },
        ImageUrl: 'https://en.wikipedia.org/wiki/Avengers:_Endgame#/media/File:Avengers_Endgame_poster.jpg'
    },
    {
        Title: 'Braveheart',
        Description: 'William Wallace, a Scottish rebel, along with his clan, sets out to battle King Edward I of England, who killed his bride a day after their marriage.',
        Director: {
            Name: 'Mel Gibson',
            Birthdate:' January 3, 1956'
        },
       Genre:{
            Name:'Action',
            Description:'The action genre is a category of entertainment that focuses on fast-paced sequences, intense physical activities, and high-energy scenes.'
        },
        ImageUrl: 'https://en.wikipedia.org/wiki/Braveheart#/media/File:Braveheart_imp.jpg'
    },
    {
        Title: 'Gladiator',
        Discription: 'Commodus takes over power and demotes Maximus, one of the preferred generals of his father, Emperor Marcus Aurelius. As a result, Maximus is relegated to fighting till death as a gladiator.',
        Director: {
            Name: 'Ridley Scott',
            Birthdate: 'November 30, 1937'
        },
        Genre :{
            Name: 'Action',
            Description: 'The action genre is a category of entertainment that focuses on fast-paced sequences, intense physical activities, and high-energy scenes.'
        },
        ImageUrl: 'https://en.wikipedia.org/wiki/Gladiator_(2000_film)#/media/File:Gladiator_(2000_film_poster).png'
    },
    {
        Title: 'The Notebook',
        Description: 'Noah, a poor man, falls in love with Allie who comes from wealth. They are forced to keep passion for each other aside due to societal pressure and a difference in the social stature of their families.',
        Director: {
            Name: 'Nick Cassavetes',
            Birthdate: 'May 21, 1959'
        },
        Genre:{
            Name: 'Romance',
            Description: 'The romance genre is a category of literature, film, and other media that focuses on love and romantic relationships between characters as the central theme'
        },
        ImageUrl: 'https://en.wikipedia.org/wiki/The_Notebook#/media/File:Posternotebook.jpg'
    },
    {
        Title: 'Titanic',
        Description: 'Rose, who is being forced to marry a wealthy man, falls in love with Jack, a talented artist, aboard the unsinkable Titanic. Unfortunately, the ship hits an iceberg, endangering their lives.',
        Director: {
            Name: 'James Cameron',
            Birthdate: 'August 16, 1954'
        },
        Genre: {
            Name:'Romance',
            Description: 'The romance genre is a category of literature, film, and other media that focuses on love and romantic relationships between characters as the central theme'
        },
        ImageUrl: 'https://en.wikipedia.org/wiki/Titanic_(1997_film)#/media/File:Titanic_(1997_film)_poster.png'
    },
    {
        Title: 'Avatar',
        Description:'Jake, a paraplegic marine, replaces his brother on the Na vi-inhabited Pandora for a corporate mission. He is accepted by the natives as one of their own, but he must decide where his loyalties lie.',
         Director: {
            Name: 'James Cameron',
            Birthdate: 'August 16, 1954'
        },
        Genre:{
            Name:'Science fiction',
            Description:'The science fiction (sci-fi) genre is a category of storytelling that explores imaginative and futuristic concepts based on scientific principles, technologies, and the potential consequences of their use.'
        },
         ImageUrl: 'https://en.wikipedia.org/wiki/Avatar_(2009_film)#/media/File:Avatar_(2009_film)_poster.jpg'
    },
    {
        Title: 'The Parent Trap',  
        Description:'Identical twins Hallie and Annie are separated after their parents divorce. Years later, they discover each other at a summer camp and decide to switch places in an effort to reunite their parents',
        Director:{
            Name: 'Nancy Meyers',
            Birthdate: 'December 8, 1948'
        },      
        Genre : {
            Name:'Comedy',
            Description:'Comedy is a genre of entertainment designed to amuse and entertain people through humor. It often involves situations, dialogue, and characters that provoke laughter or delight, focusing on lighter themes, misunderstandings, and exaggerations of everyday life.'
        },
        ImageUrl:'https://en.wikipedia.org/wiki/The_Parent_Trap_(1998_film)#/media/File:Parenttrapposter.jpg'
    },
    {
        Title: 'The Age of Adaline',
        Description: 'Adaline, who has been 29 for eight decades, meets and madly falls in love with Ellis. She is forced to make a life-altering decision after a meeting with his parents threatens to expose her secret.',
        Director: {
            Name: 'Lee Toland Krieger',
            Birthdate: 'January 24, 1983'
        },
        Genre:{
            Name: 'Romance',
            Description: 'The romance genre is a category of literature, film, and other media that focuses on love and romantic relationships between characters as the central theme'
        },
        ImageUrl: 'https://en.wikipedia.org/wiki/The_Age_of_Adaline#/media/File:The_Age_of_Adaline_film_poster.png'
    }
];


//READ
app.get('/users', (req, res) =>{
    res.status(200).json(users);
})

//CREATE
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send( 'require name')
    }
})

//UPDATE
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('id cannot be found!')
    }
})
//CREATE
    app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id);

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
    } else {
        res.status(400).send('name cannot be found!')
    }
})

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

//DELETE
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).send(` user ${id} has been deleted`);
    } else {
        res.status(400).send( 'user cannot be found!');
    }
})

//READ
app.get('/movies', (req, res) =>{
    res.status(200).json(movies);
})

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

//READ
app.get('/movies/genre/:genreName', (req, res) =>{
    const {genreName} = req.params;
    const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre;
 
    if (genre) {
         res.status(200).json(genre);
     }  else {
         res.status(404).send('no such genre')
     }
 })

 //READ
app.get('/movies/director/:directorName', (req, res) =>{
    const {directorName} = req.params;
    const director = movies.find( movie => movie.Director.Name === directorName ).Director;
 
    if (director) {
         res.status(200).json(director);
     }  else {
         res.status(404).send('no such director')
     }
})

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
})