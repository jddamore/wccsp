const fs = require('fs');
const config = require('./config.js');

const moment = require('moment-timezone');

// Webpage utilities
const express = require('express');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const cheerio = require('cheerio');

// Reference html
let htmlHead = fs.readFileSync('./html/head.html', 'utf-8');
let htmlBase = fs.readFileSync('./html/blank.html', 'utf-8');
let htmlFoot = fs.readFileSync('./html/footer.html', 'utf-8');
let navbar = fs.readFileSync('./html/navbar.html', 'utf-8');
let form = fs.readFileSync('./html/form.html', 'utf-8');
const app = express();

// DB utilites
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;
let wccsp, buffer;
if (config.db.ssl.value && config.db.ssl.pem) {
  buffer = fs.readFileSync(config.db.ssl.pem);
}

// Logging utilities
const winston = require('winston');
const morgan = require('morgan');
// const chalk = require('chalk');

let logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: './log.log',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5Mb
      maxFiles: 50,
      colorize: false
    }),
  ],
  exitOnError: false
});
logger.stream = {
  write: function (message) {
    if (message.toLowerCase().indexOf('css') === -1 && message.indexOf('/js') === -1) {
      logger.info(message);
      console.log(message);
    }
  }
};
app.use(morgan('short', { stream: logger.stream }));

// helper function
const checkUser = require('./lib/checkUser');
const validateForm = require('./lib/validateForm');

app.use(express.static('public'));
 
//home page
app.get(['/', '/home'], (req, res) => {
  if (config.debug) {
    htmlBase = fs.readFileSync('./html/blank.html', 'utf-8');
    navbar = fs.readFileSync('./html/navbar.html', 'utf-8');
  }
  let stuff = 'A database error has occured. Contact system administrator';
  wccsp.collection('announcements').find().sort({ '_id': -1 }).limit(9).toArray(function (err, result){
    if (err || !result.length) {
      console.log(err);
      let html = htmlHead + htmlBase.replace('<!-- CONTENT -->', stuff);
      html = html.replace('<!-- NAVBAR -->', navbar);
      html = html.replace('id="navhome"', 'id="navhome" class="active"' );
      html += htmlFoot + '</html>';
      res.send(html);
    }
    else {
      stuff = '';
      for (let i = 0; i < result.length; i++) {
        // open row
        if (!i || i % 3 === 0) {
          stuff += '<div class="row">';
        }
        stuff += '<div class="span4">';
        stuff += `<h2>${result[i].header}</h2>`; 
        stuff += `<p>${result[i].lead}</p>`; 
        stuff += `<p><a class="btn" href="/announcement/${result[i]._id}">View details »</a></p>`;
        stuff += '</div>';
        // close row
        if (i === 2 || i % 3 === 2 || i === result.length - 1) {
          stuff += '</div>';
        }
      } 
    }
    let html = htmlHead + htmlBase.replace('<!-- NAVBAR -->', navbar);
    html = html.replace('<!-- CONTENT -->', stuff);
    html = html.replace('id="navhome"', 'id="navhome" class="active"' );
    html += htmlFoot + '</html>';
    res.send(html);
  });
});

// announcement listing
app.get('/announcements', (req, res) => { 
  let html = htmlHead;
  wccsp.collection('announcements').find({}, { '_id': 1, header: 1, createDate: 1 }).sort({ '_id': -1 }).toArray(function (err, result) {
    html += '<body>' + navbar;
    html = html.replace('id="navannouncments"', 'id="navannouncments" class="active"' );
    html += '<div class="container"><h2>All announcements</h2><ul>';
    for (let i = 0; i < result.length; i++) { 
      html += `<li>${moment(result[i].createDate).format('dddd, MMMM Do YYYY, h:mm a')}: <a href="/announcement/${result[i]._id}">${result[i].header}</a></li>`;
    }
    html += '</ul></div></body></html>';
    res.send(html);
  });
});

// specific announcement
app.get('/announcement/*', (req, res) => {
  let html = htmlHead;
  html += '<body>' + navbar;
  html.replace('<li id="navhome"><a href="/home">Home</a></li>', '<li id="navhome"><a href="../home">Home</a></li>');
  html.replace('<li><a href="/#about">About</a></li>', '<li><a href="/../#about">About</a></li>');
  html = html.replace('id="navannouncments"', 'id="navannouncments" class="active"' );
  let id = req.url.split('/')[2];
  if (id.length !== 24) {
    html += '<div class="container"><div class="row"><h2>announcement not found!</h2></div></div></body></html>';
    res.send(html);
  } 
  else {
    wccsp.collection('announcements').findOne({ '_id': ObjectID(id) }, function (err, result) {
      if (err || !result) {
        console.log(err);
        html += '<div class="container"><div class="row"><h2>announcement not found!</h2></div></div></body></html>';
        res.send(html);
      }
      else {
        let stuff = '<div class="container">';
        stuff += '<div class="row">';
        stuff += '<div class="span12">';
        stuff += `<h2>${result.header}</h2>`; 
        stuff += `<p class="lead">${result.lead}</p>`; 
        stuff += `<p class="lead">${result.body}</p>`;
        stuff += `<p>Created on: ${moment(result.createDate).tz('America/New_York').format('dddd, MMMM Do YYYY, h:mm a')}</p>`; 
        stuff += `<p>Last edited on: ${moment(result.editDate).tz('America/New_York').format('dddd, MMMM Do YYYY, h:mm a')}</p>`; 
        stuff += `<p>Last edited by: ${result.username}</p>`; 
        stuff += '</div></div></div><hr/>';
        html += stuff;
        html += htmlFoot.replace('/siteadmin/new', `/siteadmin/edit/${id}`) + '</body>';
        res.send(html);
      } 
    });
  }
});

app.get('/siteadmin/new', (req, res) => { 
  if (config.debug) {
    form = fs.readFileSync('./html/form.html', 'utf-8');
  }
  res.send(form);
});

app.get('/siteadmin/edit/*', (req, res) => { 
  if (config.debug) {
    form = fs.readFileSync('./html/form.html', 'utf-8');
  }
  let id = req.url.split('/')[3];
  if (id.length !== 24) {
    let html = 'nothing found to edit';
    res.send(html);
  } 
  else {
    console.log('start db search');
    wccsp.collection('announcements').findOne({ '_id': ObjectID(id) }, function (err, result) {
      if (err || !result) {
        console.log(err);
        let html = 'nothing found to edit';
        res.send(html);
      }
      else {
        form = form.replace(/\.\//g, './../');
        let $ = cheerio.load(form);
        $('#header').html(result.header);
        $('#lead').html(result.lead);
        $('#body').html(result.body);
        res.send($('html').html());
      } 
    });
  }
});

// add announcement
app.post('/siteadmin/new', urlencodedParser, function (req, res) { 
  let cb = function (userCheck) {
    if (userCheck) {
      if (validateForm(req.body)) {
        let posting = {};
        posting._id = new ObjectID();
        posting.createDate = new Date();
        posting.editDate = new Date();
        posting.header = req.body.header;
        posting.lead = req.body.lead;
        posting.body = req.body.body;
        posting.username = req.body.email;

        wccsp.collection('announcements').insert(posting, function (err) {
          if (err) {
            logger.warn(err);
            res.send( { message: 'Database issue. Contact web administrator.' });
          }
          else {
            res.send({
              message: 'New entry added',
              redirect: `/announcement/${posting._id}` });
          }
        });
      }
      else {
        res.send({ message: 'Form parameters incorrect' });
      }
    }
    else {
      res.send({ message: 'user/password incorrect. Not saved.' });
    }
  };
  checkUser(req.body, wccsp, cb);
});

// edit or delete announcement
app.post('/siteadmin/edit/*', urlencodedParser, function (req, res) { 
  let id = req.url.split('/')[3];
  if (id.length !== 24) {
    res.send({ message: 'Entry error in query' });
  } 
  else {
    let cb = function (userCheck) {
      if (userCheck) {
        console.log(req.body);
        wccsp.collection('announcements').findOne({ '_id': ObjectID(id) }, function (err, result) { 
          if (err || !result) {
            console.log(err);
            res.send({ message: 'Entry error in query' });
          }
          else if (!req.body.header && !req.body.lead && !req.body.body) {
            wccsp.collection('announcements').remove({ '_id': ObjectID(id) }, function (err) {
              if (err) res.send({ message: 'Entry error in query' });
              else {
                res.send({ 
                  message: 'Entry deleted', 
                  redirect: '/' 
                });
              }
            }); 
          }
          else if (validateForm(req.body)) {
            result.editDate = new Date();
            result.header = req.body.header;
            result.lead = req.body.lead;
            result.body = req.body.body;
            result.username = req.body.email;
            wccsp.collection('announcements').update({ '_id': ObjectID(id) }, result, function (err) {
              if (err) res.send({ message: 'Entry error in query' });
              else res.send({ 
                message: 'Entry edited', 
                redirect: `/announcement/${id}`
              });
            }); 
          }
          else {
            res.send({ message: 'Form parameters incorrect' });
          }
        }); 
      }
      else {
        res.send({ message: 'user/password incorrect. Not saved.' });
      }
    };
    checkUser(req.body, wccsp, cb);
  }
});

MongoClient.connect(
  config.db.url,
  {
    ssl: config.db.ssl.value,
    sslKey: buffer,
    sslCert: buffer,
    sslPass: config.db.ssl.pass,
    checkServerIdentity: config.db.ssl.checkServerIdentity,
    sslValidate: config.db.ssl.validate
  },
  function (err, database) {
    
    if (err) {
      throw err;
    }
    else if (config.db.authentication) {
      database.authenticate(config.db.user, config.db.pass, function (err) {
        if (err) {
          throw err;
        }
        else {
          wccsp = database.db('wccsp');
          app.listen(config.port, () => logger.info(`WCCSP listening on port ${config.port}!`));
        }
      });
    }
    else {
      wccsp = database.db('wccsp');
      app.listen(config.port, () => logger.info(`WCCSP listening on port ${config.port}!`));
    }
  });

