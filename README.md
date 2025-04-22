# Movie API

This repository contains the **Movie API**, a RESTful backend application for managing movies, users, and favorite movie lists. It serves data about movies, directors, and genres, enabling users to interact with this data securely.

## Project Overview
The Movie API provides a server-side application for a movie web application. It allows CRUD operations (Create, Read, Update, Delete) for movies and user information.

The API delivers data about movies, directors, and genres, while enabling users to register, log in, and manage their list of favorite movies.

---
## Features
- User registration and authentication.
- Retrieve information about movies, genres, and directors.
- Add or remove movies from a user's list of favorites.
- Update user information.
- Delete user accounts.

---
## Technologies Used
- **Node.js** - JavaScript runtime environment.
- **Express** - Web framework for building APIs.
- **MongoDB** - NoSQL database for storing data.
- **Mongoose** - ODM for MongoDB.
- **Passport** - Middleware for authentication.
- **JWT** - JSON Web Tokens for secure access.
- **CORS** - Cross-Origin Resource Sharing.
- **Bcrypt** - Password hashing for security.

---
## Endpoints
Here is a summary of available API endpoints:

### Movies
| Request       | Endpoint                  | Description                   			|
|---------------|---------------------------|---------------------------------------------------|
| **GET**       | `/movies`                 | Returns a list of all movies in the database.     |
| **GET**       | `/movies/:title`          | Returns data of the specific movie being searched.|
| **GET**       | `/genres/:name`           | Returns data about a genre specified by it`s name.|
| **GET**       | `/directors/:name`        | Returns data about a director name.               |

### Users
| Request        | Endpoint                  | Description                                |
|----------------|---------------------------|--------------------------------------------|
| **POST**      | `/users`                   | Register a new user.                       |
| **GET**       | `/users/:id`        	     | Retrieve user data.                        |
| **PUT**       | `/users/:id`               | Update user information.                   |
| **POST**      | `/users/:id/movieTitle`    | Add a movie to favorites.                  |
| **DELETE**    | `/users/:id/movieTitle`    | Remove a movie from favorites.             |
| **DELETE**    | `/users/:id`               | Deregister a user account.                 |

### Authentication
| Request        | Endpoint                  | Description                   |
|----------------|---------------------------|-------------------------------|
| **POST**      | `/login`                  | Authenticate user credentials and return a JWT. |


---
## Prerequisites
Ensure the following tools are installed on your system:
- Node.js (v14+)
- MongoDB (running locally or via cloud provider)
- Postman or similar API testing tool (optional).

---

## Setup and Installation
Follow these steps to set up and run the API locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/plumbz/movie-api.git
   cd movie-api
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure MongoDB**:
   - Set up a MongoDB database locally or on a cloud provider (e.g., MongoDB Atlas).
   - Update the MongoDB connection URI in the project file (e.g., `config.js` or `.env` if applicable).

4. **Run the server**:
   ```bash
   npm start
   ```
   By default, the server will run on `http://localhost:8080`.

5. **Test API**:
   Use tools like **Postman** to test the endpoints.


---
## Live API
The API is hosted on Heroku and can be accessed at:

[https://movie-flix19-efb939257bd3.herokuapp.com](https://movie-flix19-efb939257bd3.herokuapp.com)

Use this base URL to interact with the endpoints described above.

---

## Dependencies
Some of the main dependencies used include:
- `express`
- `mongoose`
- `passport`
- `jsonwebtoken`
- `bcrypt`
- `cors`

