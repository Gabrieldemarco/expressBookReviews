const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { authenticated, isValid, users } = require('./router/auth_users.js'); // Importa las rutas y funciones necesarias
const genl_routes = require('./router/general.js').general;

const app = express();

const secretKey = "fingerprint"; // Clave secreta para firmar el JWT

app.use(express.json());

// Configuración de la sesión
app.use("/customer", session({ secret: secretKey, resave: true, saveUninitialized: true }));

// Middleware de autenticación para rutas protegidas
app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.headers['authorization'];
    if (token) {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(403).send("Token inválido");
            }
            req.user = decoded;
            next();
        });
    } else {
        res.status(401).send("Token faltante");
    }
});

// Ruta para iniciar sesión y generar un JWT (Usando la autenticación de usuarios que tienes)
app.post('/customer/login', (req, res) => {
    const { username, password } = req.body;

    // Verifica si el nombre de usuario es válido
    if (!isValid(username)) {
        return res.status(400).json({ message: 'Usuario no encontrado.' });
    }

    // Verifica si la contraseña es correcta
    const user = users.find(u => u.username === username);
    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).send('Credenciales inválidas');
    }
});

// Ruta de ejemplo protegida
app.get('/customer/dashboard', (req, res) => {
    res.send(`Bienvenido, ${req.user.username}`);
});

const PORT = 5004;

app.use("/customer", authenticated); // Usa las rutas de autenticación
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));