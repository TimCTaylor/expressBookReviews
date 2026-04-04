const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
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
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
