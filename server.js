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

app.get('/', homeHandler);
app.get('/favorite', handleFavorite)
app.get('/trending', handleTrending)
app.get('/search', handleSearching)
app.get('/movieGenres', handleGenres)
app.get('/certifications', handleCertifications)
// app.post('/addMovie', handleAddMovie)
app.get('/getMovies', handleGetMovies)
app.get('/getMovie/:id', handleGETMovieById)
app.put('/UPDATE/:id', handelUpdate)
app.delete('/DELETE/:id', handelDelete)

//front end endpoints
app.get('/addMovie', handleAddMovieFront)
app.post('/addMovie', handleAddMoviePostFront)
app.put('/addMovie/:id', handelFrontUpdate )
app.delete('/addMovie/:id' , handelFrontDelete)

// app.use(function (error, req, res, next) {
//   res.status(500).json({
//     statusCode: 500,
//     responseTxt: 'Sorry, something went wrong'
//   })
// }); 

app.use(errorHandler)
app.use('*', notFoundPage)


function homeHandler(req, res) {
  res.status(200).json({
    code: 200,
    message: 'Welcome to the home page!'
  })

}



function handleFavorite(req, res) {
  res.send('Welcome to Favorite Page')
}


async function handleTrending(req, res) {

  const data = await axios.get(`https://api.themoviedb.org/3/trending/all/day?api_key=${process.env.APIKEY}`)
  console.log(data.data)
  MovieData.allData = [];
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
  }).catch(err => errorHandler(err, req, res))

}

// function handleAddMovie(req, res) {
//   const userInput = req.body;
//   const sql = `insert into info(title, comments) values($1, $2) returning *`;

//   const handleValueFromUser = [userInput.title, userInput.comments];

//   client.query(sql, handleValueFromUser).then(data => {
//     res.status(201).json(data.rows)
//   }).catch(err => errorHandler(err, req, res))
// }


function handleGETMovieById(req, res) {
  const id = req.params.id
  const sql = `select * from info where id=${id}`
  MovieData.allData = [];
  client.query(sql).then(data => {
    const recObj = new MovieData(data.rows[0].id, data.rows[0].title, data.rows[0].comments)
    res.status(200).json(recObj)

  }).catch(err => errorHandler(err, req, res))
}

function handelUpdate(req, res) {
  const id = req.params.id
  const newData = req.body;
  const updatedData = [newData.title, newData.comments, id]
  const sql = `update info set title=$1, comments = $2 where id = $3 returning * `
  client.query(sql, updatedData).then(data =>
    res.status(202).json(data.rows)
  ).catch(err => errorHandler(err, req, res))

}

function handelDelete(req, res) {
  const id = req.params.id
  const sql = `delete from info where id = ${id}`;
  client.query(sql).then(() => {
    return res.status(204).json({
      // code: 204,
    })
  }).catch(err => errorHandler(err, req, res))
}



function handleAddMovieFront(req, res) {
  const sql = `select * from  front_movie_info`;
  FavMovie.all = []
  client.query(sql).then(data => {
    console.log(data)
    data.rows.map(item => new FavMovie(item.title, item.id,item.movie_id, item.poster_path, item.comments))
    res.status(200).json({
      data: FavMovie.all
      // movie: data.results.rows
    })
  }).catch(err => errorHandler(err, req, res))
}



function handleAddMoviePostFront(req,res){
  let add = req.body ;
  let sql = `INSERT INTO front_movie_info (title,comments,poster_path,movie_id)
  VALUES ($1,$2,$3,$4) RETURNING *;`
  let values = [add.title,add.comments,add.poster_path,add.movie_id];
  client.query(sql,values).then((result)=>{
      res.status(201).json(result.rows)
  }
  ).catch(err => errorHandler(err, req, res))
}

function handelFrontUpdate(req,res){
  const id = req.params.id
const userInput = req.body
const sql = `update front_movie_info set title=$1,comments =$2,poster_path =$3 ,movie_id =$4 where id =${id} returning *`
const values = [  userInput.title, userInput.comments , userInput.poster_path,  userInput.movie_id ]
client.query(sql,values).then(result =>{
res.status(202).json(result.rows)

} ).catch(err => errorHandler(err, req, res))
}


function handelFrontDelete(req,res){
  const id = req.params.id
const sql = `DELETE FROM front_movie_info WHERE id = ${id}`
client.query(sql).then(() =>{
return res.status(204).json({
code: 204
}
)
}).catch(err => errorHandler(err, req, res))
}


function notFoundPage(req, res) {
  res.status(404).json({
    statusCode: 404,
    responseTxt: 'Page Not Found Error'
  })
}

function errorHandler(error, req, res) {
  res.status(500).json({
    code: 500,
    message: error.message || error
  })
}


function MovieData(id, title, release_date, poster_path) {
  this.id = id;
  this.title = title;
  this.release_date = release_date;
  this.poster_path = poster_path;
  MovieData.allData.push(this);
}
MovieData.allData = [];



function FavMovie(title, id,movie_id, image, comments) {
  this.title = title;
  this.id = id;
 this.movie_id = movie_id
  this.poster_path = image;
  this.comments = comments;
  FavMovie.all.push(this);
}
FavMovie.all = []




client.connect().then((con) => {
  console.log(con)
  app.listen(Port, () => console.log(`Up and Running on port ${Port}`));
})



// function handleMovie(req,res){
//   let result={};
//   let newMovie = new HomeData (data.title,data.poster_path,data.overview);
//   result= newMovie;
//   res.json(result);
// }


// function HomeData(title, poster_path,  overview, ) {
//   this.title = title;
//   this.poster_path= poster_path;
//   this.overview= overview;

// }
