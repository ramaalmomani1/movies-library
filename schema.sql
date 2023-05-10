create table if not exists info (
  id serial primary key, 
  title varchar(255),
  comments varchar(255)
  
);

insert into info(title, comments) values('test','hjjkbdsnkdsd')