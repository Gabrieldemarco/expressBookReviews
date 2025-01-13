const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config(); // Para cargar las variables de entorno
let books = require("./booksdb.js"); // El archivo de base de datos de libros
const regd_users = express.Router();

let users = [
  {
    username: 'new_user12',
    password: bcrypt.hashSync('miContraseña123', 10) // Contraseña encriptada
  }
];

// Verifica si el nombre de usuario es válido (existe en la lista de usuarios)
const isValid = (username) => {
  return users.some(user => user.username === username);
}

// Verifica si el nombre de usuario y la contraseña coinciden
const authenticatedUser = (username, password) => {
  const user = users.find(u => u.username === username);
  if (user && bcrypt.compareSync(password, user.password)) {  // Comparar la contraseña encriptada
    return true;
  }
  return false;
}

// Ruta de inicio de sesión
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Verificar si se proporcionaron el nombre de usuario y la contraseña
  if (!username || !password) {
    return res.status(400).json({ message: "El nombre de usuario y la contraseña son obligatorios." });
  }

  // Verificar si el nombre de usuario es válido
  if (!isValid(username)) {
    return res.status(401).json({ message: "Usuario no registrado." });
  }

  // Verificar si las credenciales coinciden
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Contraseña incorrecta." });
  }

  // Generar el JWT
  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return res.status(200).json({ message: "Inicio de sesión exitoso", token: token });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
