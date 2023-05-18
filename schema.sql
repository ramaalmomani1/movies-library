create table if not exists info (
  id serial primary key, 
  title varchar(255),
  comments varchar(255)
  
);



create table if not exists front_movie_info (
  id serial primary key,
  movie_id integer,
  title varchar(255),
  poster_path varchar(1000),
  comments varchar(1000)
);




insert into info(title, comments) values('Titanic', '1997 film')