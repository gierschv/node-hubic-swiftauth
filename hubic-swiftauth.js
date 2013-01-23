#! /usr/bin/env node --harmony-proxies

var http = require('http'),
    ovh = require('ovh');

var Ows = ovh({
  sessionHandler:      'sessionHandler/r4',
  hubic:               'hubic/r5'
});

var cache = {};
var srv = http.createServer(function (req, res) {
  "use strict";

  res.sendResponse = function (httpCode, param) {
    if (typeof param === 'string') {
      console.error('[Error][X-Auth-User = ' + req.headers['x-auth-user'] + '] ' + param);
    }
    else if (typeof param === 'object') {
      res.setHeader('X-Storage-Url', param.url);
      res.setHeader('X-Auth-Token', param.token);
    }
    res.writeHead(httpCode);
    return res.end();
  };

  // Check headers
  if (req.headers['x-auth-user'] === undefined || req.headers['x-auth-key'] === undefined) {
    return res.sendResponse(403);
  }

  // Cached credentials
  if (cache[req.headers['x-auth-user']] !== undefined && cache[req.headers['x-auth-user']].key === req.headers['x-auth-key']) {
    console.info('[Info][X-Auth-User = ' + req.headers['x-auth-user'] + '] Use cached token');
    return res.sendResponse(204, cache[req.headers['x-auth-user']]);
  }

  Ows.sessionHandler.getAnonymousSession.call({}, function (success, response) {
    if (!success) {
      return res.sendResponse(500, response.message);
    }

    Ows.hubic.getHubics.call({ sessionId: response.session.id, email: req.headers['x-auth-user'] }, function (success, hubics) {
      if (!success) {
        return res.sendResponse(500, hubics.message);
      }

      if (hubics.length === 0) {
        return res.sendResponse(404, 'No hubiC account');
      }

      Ows.sessionHandler.login.call({ login: hubics[0].nic, password: req.headers['x-auth-key'], context: 'hubic' }, function (success, response) {
        if (!success) {
          return res.sendResponse(403, response.message);
        }

        Ows.hubic.getHubic.call({ sessionId: response.session.id, hubicId: hubics[0].id}, function (success, hubic) {
          if (!success) {
            return res.sendResponse(500, hubic.message);
          }

          // Cache storage url / token
          cache[req.headers['x-auth-user']] = {
            key: req.headers['x-auth-key'],
            url: new Buffer(hubic.credentials.username, 'base64').toString('ascii'),
            token: hubic.credentials.secret
          };

          console.info('[Info][X-Auth-User = ' + req.headers['x-auth-user'] + '] Caching token');
          return res.sendResponse(204, cache[req.headers['x-auth-user']]);
        });
      });
    });
  });
});

srv.listen(process.env.PORT || 8080, process.env.HOST);
