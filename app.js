const express = require('express');
var path = require('path');
var livereload = require('livereload');
var server = livereload.createServer();
server.watch(__dirname + "/src");
const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    app.get('/', function(req, res) {
        res.sendFile('index.html', {root : __dirname + '/dist'});
    });
    app.get('/index', function(req, res) {
        res.sendFile('queryScore.html', {root : __dirname + '/dist'});
    });

    // static files
    app.use('/config', express.static('dist/config'));
    app.use('/javascripts', express.static('dist/javascripts'));
    app.use('/javascripts', express.static(__dirname + '/node_modules/axios/dist/'));
    app.use('/javascripts', express.static(__dirname + '/node_modules/lodash/'));
    app.use('/css', express.static('dist/css'));
    app.use('/data', express.static('dist/data'));
    app.use('/images', express.static('dist/images'));
    app.use('/fonts', express.static('dist/fonts'));
    console.log('open your explorer and go to localhost:3000');

    //404 handle
    app.use(function(req, res, next) {
        res.status(404);
        res.sendFile('index.html', {root : __dirname + '/dist'});
    });

});