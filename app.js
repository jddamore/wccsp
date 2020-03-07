const fs = require('fs');
const mongodb = require('mongodb');
const express = require('express');

let  htmlBase = fs.readFileSync('./html/blank.html', 'utf-8');

const app = express()
const port = 80
const debug = true;

app.use(express.static('public'))

app.get('/', (req, res) => {
  let stuff = 'database stuff';
  if (debug) htmlBase = fs.readFileSync('./html/blank.html', 'utf-8');
  let html = htmlBase.replace('<!--CONTENT-->', stuff);
  res.send(html);
});

app.listen(port, () => console.log(`WCCSP listening on port ${port}!`))
