'use strict';

/**
 * Copyright 2016 Jim Armstrong (www.algorithmist.net)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * A variety of error handlers, most of which are similar to others you have seen.  Nothing new here :)
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */

// composed function is an alternative to try-catch in async/await block and is easily re-used
exports.catchErrors = (fn) => {
  return function(req, res, next) {
    return fn(req, res, next).catch(next);
  };
};

// Not Found Error Handler
exports.notFound = (req, res, next) => {
  const err  = new Error('(404) Not Found: ', req.url);
  err.status = 404;

  if (next) {
    next(err);
  }
};

/// MongoDB Validation Error Handler

exports.mongoErrors = (err, req, res, next) => {

  console.log( "Mongo Error: ", err, err.errors);
  if (!err.errors) {
    return next(err);
  }

  const errorKeys = Object.keys(err.errors);
  errorKeys.forEach(key => console.log('MongoDB error', err.errors[key].message));

  res.redirect('back');
};


// dev err handler - pretty much boilerplate stuff ripped from other examples
exports.devErrors = (err, req, res, next) => {
  err.stack = err.stack || '';

  const details = {
    message: err.message,
    status: err.status,
    stackHighlighted: err.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>')
  };

  res.status(err.status || 500);

  res.format({
    'text/html': () => {
      res.render('Error: ', details);
    },
    'application/json': () => res.json(details)
  });
};


// prod err handler
exports.prodErrors = (err, req, res, next) => {
  res.status(err.status || 500);

  // need to have an error view if you want to use this
  res.render('error', {
    message: err.message,
    error: {}
  });
};
