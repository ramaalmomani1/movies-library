'use strict';

const express = require('express');
const cors = require('cors');
const data = require('./ Movie Data/ data.json');
const axios = require('axios');
const pg = require('pg')
require('dotenv').config();
const client = new pg.Client(process.env.DBURL);



const app = express();
app.use(cors());
app.use(express.json());
const Port = process.env.PORT || 5000

// app.get('/', handleMovie);
app.get('/favorite', handleFavorite)
app.get('/trending', handleTrending)
app.get('/search', handleSearching)
app.get('/movieGenres', handleGenres)
app.get('/certifications', handleCertifications)
app.post('/addMovie', handleAddMovie)
app.get('/getMovies', handleGetMovies)
app.get('/getMovie/:id', handleGETMovieById)
app.put('/UPDATE/:id', handelUpdate)
app.delete('/DELETE/:id', handelDelete)

app.use(function (error, req, res, next) {
  res.status(500).json({
    statusCode: 500,
    responseTxt: 'Sorry, something went wrong'
  })
});
app.use('*', notFoundPage)


function handleFavorite(req, res) {
  res.send('Welcome to Favorite Page')
}


async function handleTrending(req, res) {

  const data = await axios.get(`https://api.themoviedb.org/3/trending/all/day?api_key=${process.env.APIKEY}`)
  console.log(data.data)

  data.data.results.map(item =>
    new MovieData(item.id, item.title, item.release_date, item.poster_path, item.overview)
  )

  res.status(200).json({
    results: MovieData.allData

  })
}

async function handleSearching(req, res) {

  const searchQuery = req.query.search;
  const data = await axios.get(`https://api.themoviedb.org/3/search/company?api_key=${process.env.APIKEY}&query=${searchQuery}`)
  console.log(data.data)
  res.status(200).json({
    results: data.data
  })
}


async function handleGenres(req, res) {
  const data = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.APIKEY}&language=en-US`)
  console.log(data.data)
  res.status(200).json({
    results: data.data
  })
}

async function handleCertifications(req, res) {
  const data = await axios.get(`https://api.themoviedb.org/3/certification/movie/list?api_key=${process.env.APIKEY}`)
  console.log(data.data)
  res.status(200).json({
    results: data.data
  })
}



function handleGetMovies(req, res) {
  const sql = `SELECT * FROM  info`;
  client.query(sql).then(data => {
    console.log(data)
    res.json({

      data: data.rows
    })
  }).catch(err => console.log("anything"))

}

function handleAddMovie(req, res) {
  const userInput = req.body;
  const sql = `insert into info(title, comments) values($1, $2) returning *`;

  const handleValueFromUser = [userInput.title, userInput.comments];

  client.query(sql, handleValueFromUser).then(data => {
    res.status(201).json(data.rows)
  }).catch(err => console.log("anything"))
}


function handleGETMovieById(req, res) {
  const id = req.params.id
  const sql = `select * from info where id=${id}`
  client.query(sql).then(data => {
    const recObj = new MovieData(data.rows[0].id, data.rows[0].title, data.rows[0].comments)
    res.status(200).json(recObj)

  })
}

function handelUpdate(req,res){
  const id = req.params.id
  const newData = req.body;
  const updatedData = [newData.title, newData.comments, id]
  const sql = `update info set title=$1, comments = $2 where id = $3 returning * `
  client.query(sql,updatedData).then(data =>
    res.status(202).json(data.rows)
  )

}

function handelDelete(req,res){
  const id = req.params.id
    const sql = `delete from info where id = ${id}`;
    client.query(sql).then(() => {
      return res.status(204).json({
        // code: 204,
      })
    }).catch(err => console.log("anything"))
  }





function notFoundPage(req, res) {
  res.status(404).json({
    statusCode: 404,
    responseTxt: 'Page Not Found Error'
  })
}


function MovieData(id, title, release_date, poster_path, overview) {
  this.id = id;
  this.title = title;
  this.release_date = release_date;
  this.poster_path = poster_path;
  this.overview = overview;
  MovieData.allData.push(this);
}
MovieData.allData = [];

client.connect().then((con) => {
  console.log(con)
  app.listen(Port, () => console.log(`Up and Running on port ${Port}`));
})


// function handleMovie(req,res){
//   let result={};
//   let newMovie = new MovieData (data.title,data.poster_path,data.overview);
//   result= newMovie;
//   res.json(result);
// }


// function MovieData(title, poster_path,  overview, ) {
//   this.title = title;
//   this.poster_path= poster_path;
//   this.overview= overview;

// }