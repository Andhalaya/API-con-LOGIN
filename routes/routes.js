const express = require('express');
const {generateToken, verifyToken} = require('../middlewares/authMiddleware');
const users = require('../data/users')
const router = express.Router();
const axios = require('axios');

router.get('/', (req, res) => {
    if(req.session.token) {
      res.send(`
      <h1>Bienvendido</h1>
      <a href="/search">search</a>
      <form action="/logout" method="post">
        <button type="submit">Cerrar sesion</button>
      </form>
      `)
    } else { 
      const loginForm = `
      <form action="/login" method="post">
        <label for="username">Usuario:</label>
        <input type="text" id="username" name="username" required><br>
    
        <label for="password">Contraseña:</label>
        <input type="text" id="password" name="password" required><br>
    
        <button type="submit">Iniciar sesión</button>
      </form>
    
      <a href="/character">characters</a>
      `;
    
      res.send(loginForm)}
  });

router.post('/login', (req, res) => {
    const {username, password} = req.body;
    const user = users.find(user => user.username === username &&user.password === password)
  
    if(user) {
      const token = generateToken(user)
      req.session.token = token;
      res.redirect('/character')
    } else {
      res.status(401).json({mensaje: 'Credenciales incorrectas'})
    }
  });
  

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

router.get('/character', verifyToken, async (req, res) => {
        const url = `https://rickandmortyapi.com/api/character`;
        try {
            const response = await axios.get(url);
            const data = response.data

            res.json({data});
        } catch (error) {
            res.status(404).json({ error: 'personaje no encontrado' });
        }
        
});

router.get('/character/:name', async (req, res) => {
    const name = req.params.name;
    const url = `https://rickandmortyapi.com/api/character/?name=${name}`;

    try {
        const response = await axios.get(url);
        const {name, status, species, gender, origin, image} = response.data.results[0];

        res.json({name, status, species, gender, origin: origin.name, image});
    } catch (error) {
        res.status(404).json({ error: 'personaje no encontrado' });
    }
});

router.get('/search', verifyToken, (req, res) => {
    res.send(`
    <h1>Buscador Rick & Morty</h1>
    <label for="characterName">Introduce el nombre de tu personaje</label>
    <input type="text" id="characterName" placeholder="Rick">
    <button onclick="getCharacterInfo()">Obtener Informacion</button>
    `)
})

module.exports = router;
  