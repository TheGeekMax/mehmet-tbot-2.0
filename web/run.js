//on fait un server web de base
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const server = http.createServer(app);

//on fait la route pour le dossier public
app.use(express.static(path.join(__dirname, 'public')));

//on ajoute la route data qui envoie le contenue fichier ../keywords.json
app.get('/data', (req, res) => {
    fs.readFile(path.join(__dirname, '../keywords.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        res.send(data);
    });
});

//on fait le server web sur le port 3000
server.listen(3000, () => {
    console.log('Server is running...');
});