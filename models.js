const mongoose = require( 'mongoose' );

let movieSchema = mongoose.Schema ({
    title: {type: String, required: true},
    description: {type: String, required: true},
    genre: {
        name: String,
        description: String
    },
    director:{
        name: String,
        bio: String,
        birthdate: Date,
        deathdate: Date
    },
    imagePath: String,
    featured: Boolean


});

let userSchema= mongoose.Schema({
    email: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    password: {type: String, required: true},
    birthday: {Date},
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    username: {type: String, requied: true}
});

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema)

module.exports.Movie = Movie;
module.exports.User = User;

// mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });