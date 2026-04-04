const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//Check is the username is valid. We don't have a spec for this, and it's not used. Proabably
// forgotten about by the course creators. I think I'll assume we simply
// want to check that the username is alphanumeric and more than 5 characters.
   
   return /^[a-zA-Z0-9]{5,}$/.test(username);
}

// Check if the user with the given username and password exists
const authenticatedUser = (username,password)=>{ //returns boolean
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review. Identify the book by ISBN in the URL, and the review content will be in the request body. 
// The username of the reviewer will be identified from req.session (we store access token and username
// in the Authenticate user part of the login route, which is just about this route.
regd_users.put("/auth/review/:isbn", (req, res) => {
  const sessionUsername = req.session.authorization.username;
  const targetISBN = req.params.isbn;
  const reviewContent = req.body.review;  
  const book = books[targetISBN];
  if (book) {
    book.reviews[sessionUsername] = reviewContent; // This will add a new review or overwrite an existing review by the same user, which is what we want.
    return res.status(200).send(`Review for book with ISBN ${targetISBN} has been added/updated.`);
  } else {
    return res.status(404).send(`Book with ISBN ${targetISBN} not found.`);
  }
});

// Delete a book review. Identify the book by ISBN in the URL, and the review content will be in the request body. 
// The username of the reviewer will be identified from req.session (we store access token and username
// in the Authenticate user part of the login route, which is just about this route.
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const sessionUsername = req.session.authorization.username;
  const targetISBN = req.params.isbn;
  const book = books[targetISBN];
  if (book) {
    delete book.reviews[sessionUsername]; // This will delete the review by the user. No error is thrown if no review by that user exists, which is fine.
    return res.status(200).send(`Review for book with ISBN ${targetISBN} has been deleted.`);
  } else {
    return res.status(404).send(`Book with ISBN ${targetISBN} not found.`);
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
