/*
  imports
*/
require('./tracing')
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const swig = require('swig');
const express = require('express');
const {wrapMainKnexAsMiddleware} = require('@google-cloud/sqlcommenter-knex');
const Knex = require('knex');


const app = express();
const PORT = process.env.PORT || 3000;
const knex = require('./db/knex');

/*
  middleware
*/

app.use(wrapMainKnexAsMiddleware(
            Knex,
            include={
                db_driver: true,
                route: true,
                traceparent: true,
                tracestate: true,
            },
            options={ TraceProvider: 'OpenTelemetry' }
        ));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// *** view engine *** //
 swag = new swig.Swig();
app.engine('html', swag.renderFile);
app.set('view engine', 'html');


// *** static directory *** //
app.set('views', path.join(__dirname, 'views'));


// *** config middleware *** //
app.use(logger('dev'));
app.use(cookieParser());
/*
  routes
*/

app.get('/', (req, res) => {
  res.json('pong!');

});
// return ALL users
app.get('/users', function(req, res, next) {
knex('users')
   .then(function(data) {
        res.status(200)
          .json({
            status: 'success',
            data: data
          });
      })
      .catch(function(err) {
        res.status(500)
          .json({
            status: 'error',
            data: err.message
          });
      });
  });

app.get('users/:id', function(req, res, next) {
 knex('users')
  .where({ id:  parseInt(req.params.id) })
   .then(function(data) {
        res.status(200)
          .json({
            status: 'success',
            data: data
          });
      })
      .catch(function(err) {
        res.status(500)
          .json({
            status: 'error',
            data: err.message
          });
      });
  });
// add user
app.post('/users', function(req, res, next) {
    knex('users')
      .insert({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
      })
      .then(function(data) {
                  /* jshint ignore:start */
                  res.status(200)
                    .json({
                      status: 'success',
                      data: `Added ${data.rowCount} row`
                    });})
      .catch((function(err) {
                   res.status(500)
                     .json({
                       status: 'error',
                       data: err.message
                     });}))
});

app.put('/users/:id', (req, res) => {
  knex('users')
  .where({ id: parseInt(req.params.id) })
  .update({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  })
  .then(function(data) {
         /* jshint ignore:start */
         res.status(200)
           .json({
             status: 'success',
             data: `Updated ${data} row`
           });
         /* jshint ignore:end */
       })
       .catch(function(err) {
         res.status(500)
           .json({
             status: 'error',
             data: err.message
           });
       });
 });


app.delete('/users/:id', (req, res) => {
  knex('users')
  .where({ id: parseInt(req.params.id) })
  .del()
       .then(function(data) {
         /* jshint ignore:start */
         res.status(200)
           .json({
             status: 'success',
             data: `Deleted ${data} row`
           });
         /* jshint ignore:end */
       })
       .catch(function(err) {
         res.status(500)
           .json({
             status: 'error',
             data: err.message
           });
       });
 });
app.get('/posts', (req, res) => {
  knex('posts')
  .then(function(data) {
          res.status(200)
            .json({
              status: 'success',
              data: data
            });
        })
        .catch(function(err) {
          res.status(500)
            .json({
              status: 'error',
              data: err.message
            });
        });
    });
app.get('/todos', (req, res) => {
  knex('todos')
  .then(function(data) {
          res.status(200)
            .json({
              status: 'success',
              data: data
            });
        })
        .catch(function(err) {
          res.status(500)
            .json({
              status: 'error',
              data: err.message
            });
        });
    });

app.get('/todos/:id', (req, res) => {
  knex('todos')
  .where({ id:  parseInt(req.params.id) })
   .then(function(data) {
          res.status(200)
            .json({
              status: 'success',
              data: data
            });
        })
        .catch(function(err) {
          res.status(500)
            .json({
              status: 'error',
              data: err.message
            });
        });
    });

app.post('/todos', (req, res) => {
  knex('todos')
  .insert({
    title: req.body.title,
    completed: false
  })
  .then(function(data) {
                   /* jshint ignore:start */
                   res.status(200)
                     .json({
                       status: 'success',
                       data: `Added ${data.rowCount} row`
                     });})
       .catch((function(err) {
                    res.status(500)
                      .json({
                        status: 'error',
                        data: err.message
                      });}))
 });

app.put('/todos/:id', (req, res) => {
  knex('todos')
  .where({ id: parseInt(req.params.id) })
  .update({
    title: req.body.title,
    completed: req.body.completed
  })
  .then(function(data) {
           /* jshint ignore:start */
           res.status(200)
             .json({
               status: 'success',
               data: `Updated ${data} row`
             });
           /* jshint ignore:end */
         })
         .catch(function(err) {
           res.status(500)
             .json({
               status: 'error',
               data: err.message
             });
         });
   });

app.delete('/todos/:id', (req, res) => {
  knex('todos')
  .where({ id: parseInt(req.params.id) })
  .del()
  .then(function(data) {
           /* jshint ignore:start */
           res.status(200)
             .json({
               status: 'success',
               data: `Deleted ${data} row`
             });
           /* jshint ignore:end */
         })
         .catch(function(err) {
           res.status(500)
             .json({
               status: 'error',
               data: err.message
             });
         });
   });

/*
  run server
*/

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
