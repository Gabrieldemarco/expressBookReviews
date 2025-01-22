const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config(); // Para cargar las variables de entorno
let books = require("./booksdb.js"); // El archivo de base de datos de libros
const regd_users = express.Router();

let users = [];

// Verifica si el nombre de usuario es válido (existe en la lista de usuarios)
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Verifica si el nombre de usuario y la contraseña coinciden
const authenticatedUser = (username, password) => {
  const user = users.find(u => u.username === username);
  if (user && bcrypt.compareSync(password, user.password)) { // Comparar la contraseña encriptada
    return true;
  }
  return false;
};

// Ruta para iniciar sesión
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Verifica si el nombre de usuario existe
  if (!isValid(username)) {
    return res.status(400).json({ message: 'Usuario no encontrado.' });
  }

  // Busca el usuario en la lista
  const user = users.find(u => u.username === username);

  // Verifica si la contraseña coincide
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ message: 'Contraseña incorrecta.' });
  }

  // Si las credenciales son correctas
  return res.status(200).json({ message: 'Inicio de sesión exitoso.' });
});

// Ruta para registrar un nuevo usuario
regd_users.post('/register', (req, res) => {
  const { username, password } = req.body; // Recibe el nombre de usuario y la contraseña

  // Verifica si el nombre de usuario ya existe
  if (isValid(username)) {
    return res.status(400).json({ message: 'El nombre de usuario ya existe.' });
  }

  // Verifica si el nombre de usuario y la contraseña fueron proporcionados
  if (!username || !password) {
    return res.status(400).json({ message: 'El nombre de usuario y la contraseña son obligatorios.' });
  }

  // Encripta la contraseña y guarda el nuevo usuario
  const hashedPassword = bcrypt.hashSync(password, 10);
  users.push({ username, password: hashedPassword }); // Guarda el usuario en la lista 'users'

  return res.status(201).json({ message: 'Usuario registrado con éxito.' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
