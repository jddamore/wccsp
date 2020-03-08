const fs = require('fs');
const mongodb = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const cheerio = require('cheerio');

let  htmlBase = fs.readFileSync('./html/blank.html', 'utf-8');
let  navbar = fs.readFileSync('./html/navbar.html', 'utf-8');
let form = fs.readFileSync('./html/form.html', 'utf-8')

const app = express()
const port = 80
const debug = true;


app.use(express.static('public'))
 
//home page
app.get(['/', '/home'], (req, res) => {
  let stuff = 'database stuff';
  if (debug) {
    htmlBase = fs.readFileSync('./html/blank.html', 'utf-8');
    navbar = fs.readFileSync('./html/navbar.html', 'utf-8');
  }
  let html = htmlBase.replace('<!-- CONTENT -->', stuff);
  html = html.replace('<!-- NAVBAR -->', navbar);
  html = html.replace('id="navhome"', 'id="navhome" class="active"' )
  res.send(html);
});

// announcement listing
app.get('/announcements', (req, res) => { 
  let html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>WCCSP</title><meta name="viewport" content="width=device-width, initial-scale=1.0"><link href="/css/bootstrap.min.css" rel="stylesheet" media="screen"><link href="/css/bootstrap-responsive.css" rel="stylesheet"></head>';
  html += '<body>' + navbar;
  html = html.replace('id="navannouncments"', 'id="navannouncments" class="active"' )
  html += '<div class="row"><br/><br/>annoucnement go here</div></body></html>';
  res.send(html);
});

// specific announcement

app.get('/siteadmin/new', (req, res) => { 
  if (debug) {
    form = fs.readFileSync('./html/form.html', 'utf-8');
  }

  res.send(form);
});

// add announcment
app.post('/siteadmin/new', urlencodedParser, (req, res) => { 
  console.log(req.body);
  res.send('ok');
});

// edit announcment

// delete announcment

app.listen(port, () => console.log(`WCCSP listening on port ${port}!`))
