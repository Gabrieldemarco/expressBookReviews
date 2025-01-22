const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Devolver la lista de libros en formato JSON ordenado
    return res.status(200).json({
        message: "Lista de libros disponibles",
        books: JSON.stringify(books, null, 2) // Mostrar datos en formato ordenado
    });
});
// Get book details based on ISBN
// Obtener detalles del libro por "ISBN"
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    
    if (book) {
        return res.status(200).json({
            message: "Detalles del libro encontrados",
            book: book
        });
    } else {
        return res.status(404).json({
            message: `No se encontró un libro con el ISBN: ${isbn}`
        });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    // Recupera el autor de los parámetros de la solicitud
    const author = req.params.author.toLowerCase();
  
    // Filtra los libros por autor
    let booksByAuthor = [];
  
    // Itera a través de todos los libros en el objeto 'books'
    for (let key in books) {
      if (books[key].author.toLowerCase().includes(author)) {
        booksByAuthor.push({
          isbn: key,
          author: books[key].author,
          title: books[key].title,
          reviews: books[key].reviews
        });
      }
    }
  
    // Si se encuentran libros con ese autor, se devuelven
    if (booksByAuthor.length > 0) {
      return res.status(200).json({
        message: `Libros encontrados de autor ${author}`,
        books: booksByAuthor
      });
    } else {
      return res.status(404).json({
        message: `No se encontraron libros de autor ${author}`
      });
    }
  });
  

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase(); // Obtener el título de los parámetros y convertirlo a minúsculas
    let foundBooks = [];
  
    // Iterar sobre las claves del objeto 'books'
    for (let key in books) {
      if (books[key].title.toLowerCase().includes(title)) { // Verificar si el título contiene la búsqueda
        foundBooks.push(books[key]);
      }
    }
  
    // Si se encontraron libros con ese título, se devuelven
    if (foundBooks.length > 0) {
      return res.status(200).json({
        message: `Libros encontrados con el título: "${title}"`,
        books: foundBooks
      });
    } else {
      // Si no se encontró ningún libro con ese título, se devuelve un mensaje de error
      return res.status(404).json({
        message: `No se encontraron libros con el título: "${title}"`
      });
    }
  });
// Ruta para agregar o modificar reseñas de un libro
public_users.post('/review/:isbn', function (req, res) {
    const { username } = req.body;  // Obtener el nombre de usuario desde el cuerpo de la solicitud
    const { review } = req.body;    // Obtener la reseña desde el cuerpo de la solicitud
    const isbn = req.params.isbn;   // Obtener el ISBN del libro desde los parámetros de la URL
    
    // Verificar si el libro con el ISBN proporcionado existe
    let book = books[isbn];
  
    if (book) {
        // Si el libro tiene reseñas y el usuario ya ha dejado una reseña para este libro
        if (book.reviews && book.reviews[username]) {
            // Si ya existe una reseña del mismo usuario, la modificamos
            book.reviews[username] = review;
            return res.status(200).json({
                message: `Reseña modificada para el libro con ISBN: ${isbn}`,
                review: book.reviews[username]
            });
        } else {
            // Si no existe una reseña del usuario, la agregamos
            if (!book.reviews) {
                book.reviews = {}; // Si no existe el objeto de reseñas, lo inicializamos
            }
            book.reviews[username] = review;
            return res.status(201).json({
                message: `Reseña agregada para el libro con ISBN: ${isbn}`,
                review: book.reviews[username]
            });
        }
    } else {
        // Si el libro no existe
        return res.status(404).json({
            message: `No se encontró el libro con ISBN: ${isbn}`
        });
    }
});

  public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Obtener el ISBN desde los parámetros de la URL
    let book = books[isbn]; // Buscar el libro por el ISBN
  
    if (book) {
      // Verificar si el libro tiene reseñas
      if (Object.keys(book.reviews).length > 0) {
        return res.status(200).json({
          message: `Reseñas para el libro con ISBN: ${isbn}`,
          reviews: book.reviews
        });
      } else {
        // Si el libro no tiene reseñas
        return res.status(404).json({
          message: `No se encontraron reseñas para el libro con ISBN: ${isbn}`
        });
      }
    } else {
      // Si no se encuentra el libro con el ISBN proporcionado
      return res.status(404).json({
        message: `No se encontró el libro con ISBN: ${isbn}`
      });
    }
  });
  

module.exports.general = public_users;
