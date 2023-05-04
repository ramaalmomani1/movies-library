'use strict';

const express = require('express');
const cors = require('cors');
const data = require('./ Movie Data/ data.json');

const app = express();
app.use(cors());

app.use(express.json());

app.get('/', handleMovie);
app.get('/favorite', handleFavorite)

app.use(function(error, req, res, next) {
  res.status(500).json({
    statusCode: 500,
    responseTxt:'Sorry, something went wrong'
  })
});
app.use('*', notFoundPage)


function handleFavorite(req, res){
  res.send('Welcome to Favorite Page')
}


function notFoundPage(req, res) {
  res.status(404).json({
    statusCode: 404,
    responseTxt: 'Page Not Found Error'
  })
}

function handleMovie(req,res){
  let result={};
  let newMovie = new MovieData (data.title,data.poster_path,data.overview);
  result= newMovie;
  res.json(result);
}
function MovieData(title, poster_path,  overview, ) {
  this.title = title;
  this.poster_path= poster_path;
  this.overview= overview;

}

app.listen(4500, () => console.log(`Up and Running on port 4500`));



