#! /usr/bin/env node

var fs = require('fs'),
    crypto = require('crypto'),
    http = require('http'),
    https = require('https'),
    url = require('url'),
    querystring = require('querystring');

if (typeof(process.env.APP_KEY) == 'undefined' ||
    typeof(process.env.APP_SECRET) == 'undefined' ||
    typeof(process.env.BASE_URL) == 'undefined') {
  console.error('Please use APP_KEY, APP_SECRET and BASE_URL env variables');
  process.exit(1);
}

var cache = {};
var httpListener = function (req, res) {
  "use strict";

  var query = url.parse(req.url, true).query;
  var tokenRequest = function (params, callback) {
    var authorization = new Buffer(
      process.env.APP_KEY + ':' + process.env.APP_SECRET
    ).toString('base64');

    var req = https.request({
        hostname: 'api.hubic.com',
        port: 443,
        path: '/oauth/token/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + authorization
        }
      },
      function (res) {
        if (res.statusCode !== 200) {
          return callback(res.statusCode);
        }

        var body = '';
        res.on('data', function (buff) {
          body += buff;
        });

        res.on('end', function () {
          body = JSON.parse(body);
          callback(null, body.access_token, body.refresh_token);
        });
      }
    );

    req.on('error', callback);
    req.write(querystring.stringify(params));
    req.end();
  };

  var apiGetCredentials = function (access_token, callback) {
    var req = https.request({
        hostname: 'api.hubic.com',
        port: 443,
        path: '/1.0/account/credentials',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + access_token
        }
      },
      function (res) {
        if (res.statusCode !== 200) {
          return callback(res.statusCode);
        }

        var body = '';
        res.on('data', function (buff) {
          body += buff;
        });

        res.on('end', function () {
          body = JSON.parse(body);
          callback(null, body.endpoint, body.token);
        });
      }
    );

    req.on('error', callback);
    req.end();
  };

  res.sendResponse = function (httpCode, param) {
    if (typeof param === 'string') {
      res.write(param);
    }
    else if (typeof param === 'object') {
      res.setHeader('X-Storage-Url', param.url);
      res.setHeader('X-Auth-Token', param.token);
    }
    res.writeHead(httpCode);
    return res.end();
  };

  // Get the {access,refresh}_token
  if (typeof(query.code) != 'undefined') {
    tokenRequest({
        grant_type: 'authorization_code',
        code: query.code,
        redirect_uri: process.env.BASE_URL
      },
      function (err, access_token, refresh_token) {
        if (err) {
          console.error('[Error]', err);
          res.setHeader('Location', '/');
          return res.sendResponse(301);
        }

        res.setHeader('Content-Type', 'text/plain');
        return res.end(
          "Now you can use the Swift v1 API using these credentials:\n" +
          "\tEndpoint: " + process.env.BASE_URL + "\n" +
          "\tUser: hubic\n" +
          "\tPassword: " + refresh_token + "\n\n" +
          "Example if you use the Swift cli client:\n" +
          "\t$ swift -A " + process.env.BASE_URL + "auth/v1.0 -U hubic -K " +
          refresh_token + "\n"
        );
      }

    );
  }
  // Redirect to login page
  else if (typeof(req.headers['x-auth-user']) == 'undefined' ||
           typeof(req.headers['x-auth-key']) == 'undefined') {
    res.setHeader(
      'Location',
      'https://api.hubic.com/oauth/auth/?' +
      querystring.stringify({
        client_id: process.env.APP_KEY,
        redirect_uri: process.env.BASE_URL,
        scope: 'credentials.r',
        response_type: 'code'
      })
    );

    return res.sendResponse(301);
  }
  // Get swift token
  else {
    tokenRequest({
        grant_type: 'refresh_token',
        refresh_token: req.headers['x-auth-key']
      },
      function (err, access_token) {
        if (err) {
          console.error('[Error]', err);
          return res.sendResponse(500);
        }

        apiGetCredentials(
          access_token,
          function (err, url, token) {
            if (err) {
              console.error('[Error]', err);
              return res.sendResponse(500);
            }

            return res.sendResponse(200, { url: url, token: token });
          }
        );
      }
    );
  }
}

var srv = http.createServer(httpListener);
srv.listen(process.env.PORT || 8080, process.env.HOST);
