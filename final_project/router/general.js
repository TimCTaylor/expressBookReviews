const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Debugging function -- you'd never release this for production code. Lists all users.
public_users.get('/allusers',function (req, res) {
  return res.send(JSON.stringify(users,null,4));

});

// Get the book list available in the shop
// NOTE on Express:
// The Express framework does not use the return value for routers. So adding the return statement is redundant, 
// strictly speaking. However, the IBM course says this remains a good pattern because:
// (1) It ceases execution at that point and avoids the potential for running later code that is not intended to be run.
// (2) It's been the syntax for how functions work in almost all environments since the 1960s, making it such a familiar pattern
//     to all developers that it makes sense to use this return pattern.
//
// NOTE 2:
// The IBM course tells us to use JSON.stringify() to tidy the output, which is whyu I've done it here. However, Express's 
// res.json() method already does this for us, so we can just use res.json(books) and it will handle the stringification 
// and setting the correct content type for us. Nice!
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books,null,4));

});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const targetISBN = req.params.isbn;
  const book = books[targetISBN];
  if (book) {
    return res.send(JSON.stringify(book, null, 4));
  } else {
    return res.status(404).send(`Book with ISBN ${targetISBN} not found.`);
  }
  
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  // I strip out whitespace and more and then in the filter(), I use includes() rather than a check for equality
  // to allow for partial matches on surname only. This is useful for practical reasons (I wish in my real publishing career
  // real book publishing systems were insensitive to choices of punctuation and whitespace). And, of course, the 
  // url for the param can't have the whitespace that we do in the books db.
  // If I were doing this for production code, I would also address diacritics.
  function normalizeAuthorString(str) {
    return str.replace(/[\s\.\-]+/g, '').toLowerCase();
  }
  const targetAuthor = normalizeAuthorString(req.params.author);
  const bookKeys = Object.keys(books);  
  const matchingBooks = bookKeys.filter(key => normalizeAuthorString(books[key].author).includes(targetAuthor)).map(key => books[key]);
  if (matchingBooks.length > 0) {
    return res.send(JSON.stringify(matchingBooks, null, 4));
  } else {
    return res.status(404).send(`No books found by author ${targetAuthor}.`);
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  function normalizeTitleString(str) {
    return str.replace(/[\s\-]+/g, '').toLowerCase();
  }
  const targetTitle = normalizeTitleString(req.params.title);
  const bookKeys = Object.keys(books);  
  const matchingBooks = bookKeys.filter(key => normalizeTitleString(books[key].title).includes(targetTitle)).map(key => books[key]);
  if (matchingBooks.length > 0) {
    return res.send(JSON.stringify(matchingBooks, null, 4));
  } else {
    return res.status(404).send(`No books found with title ${targetTitle}.`);
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const targetISBN = req.params.isbn;
  const book = books[targetISBN];
  if (book) { // Note that the book may exist but have no reviews, in which case we will return an empty stringified object, which is fine.
    return res.send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).send(`Book with ISBN ${targetISBN} not found.`);
  }
});


// The section below is for questions 10-13 for the final project assessment.
// Here I show how to use axios to make HTTP requests to the existing server endpoints. 
// It's a bit weird to have here in the server code, but essentially, I am simulating how I would make async REST calls from a client.

async function callGetBooks() {
    try {
        const response = await axios.get('http://localhost:5000/');
        console.log("\nAxios GET call to the get all books endpoint.");
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}

async function callGetBookByISBN(isbn) {
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        console.log(`\nAxios GET call to the get book by ISBN endpoint for ISBN ${isbn}.`);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}

async function callGetBookByAuthor(author) {
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`); 
        console.log(`\nAxios GET call to the get book by author endpoint for author ${author}.`);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    } 
}

async function callGetBookByTitle(title) {
    try {
        const response = await axios.get(`http://localhost:5000/title/${title}`); 
        console.log(`\nAxios GET call to the get book by title endpoint for title ${title}.`);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    } 
}

callGetBooks();
callGetBookByISBN(2);
callGetBookByAuthor("Unknown");
callGetBookByTitle("Gilgamesh");


module.exports.general = public_users;
