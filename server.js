'use strict';

const express = require('express');
const cors = require('cors');
const data = require('./ Movie Data/ data.json');
const axios = require('axios');
const pg = require ('pg')

const client = new pg.Client(process.env.DBURL);

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
const Port = process.env.PORT || 5000

// app.get('/', handleMovie);
app.get('/favorite', handleFavorite)
app.get('/trending', handleTrending )
app.get('/search', handleSearching )
app.get('/movieGenres', handleGenres )
app.get('/certifications', handleCertifications )
app.post('/addMovie ', handleAddMovie  )
app.get('/getMovies', handleGetMovies )

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


async function handleTrending(req, res){

  const data = await axios.get (`https://api.themoviedb.org/3/trending/all/day?api_key=${process.env.APIKEY}`)
  console.log(data.data)

  data.data.results.map(item => 
      new MovieData (item.id, item.title, item.release_date, item.poster_path, item.overview )
    )

  res.status(200).json({

    // results : data.data.results
results : MovieData.allData

  })
  }

  async function handleSearching(req, res) {
   
    const searchQuery = req.query.search;
    const data=await axios.get(`https://api.themoviedb.org/3/search/company?api_key=${process.env.APIKEY}&query=${searchQuery}`)    
    console.log(data.data)
      res.status(200).json({
        results:  data.data
      })
  }

  
  async function handleGenres(req, res) {
    const data=await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.APIKEY}&language=en-US`)    
    console.log(data.data)
      res.status(200).json({
        results:  data.data
      })
}

async function handleCertifications(req, res) {
  const data=await axios.get(`https://api.themoviedb.org/3/certification/movie/list?api_key=${process.env.APIKEY}`)    
  console.log(data.data)
    res.status(200).json({
      results:  data.data
    })
}


// //////////////get req
function handleGetMovies(req, res){
  const sql = `select * from info`;
  client.query(sql).then(data => {
    console.log(data)
    res.json({
    
      data: data.rows
    })
  }).catch(err => (err,res,req))

}






//////////////Post req
function handleAddMovie(req, res){
    const userInput = req.body;
    const sql = `insert into info(title, comments) values($1, $2) returning *`;
  
    const handleValueFromUser = [userInput.title, userInput.comments];
  
    client.query(sql, handleValueFromUser).then(data => {
      res.status(201).json(data.rows)
    }).catch(err => errorHandler(err, req, res))
  }
  









function notFoundPage(req, res) {
  res.status(404).json({
    statusCode: 404,
    responseTxt: 'Page Not Found Error'
  })
}


function MovieData(id, title, release_date, poster_path, overview ) {
  this.id = id;
  this.title = title;
  this.release_date =  release_date;
  this.poster_path= poster_path;
  this.overview= overview;
  MovieData.allData.push(this);
}
MovieData.allData = [];

client.connect().then( (con) => {
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