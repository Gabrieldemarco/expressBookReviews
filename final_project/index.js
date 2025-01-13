const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

const secretKey = "fingerprint_customer"; // Clave secreta para firmar el JWT

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

// Ruta para iniciar sesión y generar un JWT
app.post('/customer/login', (req, res) => {
    const { username, password } = req.body;
    // Simulación de autenticación de usuario
    if (username === 'user' && password === 'password') {
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

const PORT = 5001;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
