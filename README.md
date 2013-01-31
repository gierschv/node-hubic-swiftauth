Node hubiC Swift Authentication
===============================

**This script is unofficial and consequently not maintained by OVH.**

This script provides a simple Node.js HTTP server responding to a standard OpenStack Swift authentication request (v1.0).
Tested with *Swift CLI* and *Cyberduck*.

Install dependencies and launch on UNIX:

```
$ npm install -d
$ HOST=127.0.0.1 PORT=3000 node --harmony-proxies hubic-swiftauth.js
```

Install dependencies and launch on Windows (example with SSL):

```
cmd /C "npm install -d"
SET HOST=127.0.0.1
SET PORT=443
SET SSL=1
node --harmony-proxies hubic-swiftauth.js
```

You can run it as https while defining the *SSL* environment variable, the key / certificat used are in folder *misc*.

Usage example with CURL and Swift CLI

```
$ curl -D - \
     -H "X-Auth-User: my-hubic-account@domain.tld" \
     -H "X-Auth-Key: my-hubic-password" \
     http://localhost:3000/v1.0
HTTP/1.1 204 No Content
X-Storage-Url: https://endpoint.hubic.ovh.net/v1/AUTH_00000000000000000000000000000000
X-Auth-Token: 00000000000000000000000000000000
Date: Tue, 22 Jan 2013 16:30:37 GMT
Connection: keep-alive

$ swift -A http://localhost:3000/v1.0 -U my-hubic-account@domain.tld -K my-hubic-password stat
   Account: AUTH_00000000000000000000000000000000
Containers: 3
   Objects:
     Bytes:
Meta Quota:
Meta Temp-Url-Key:
X-Timestamp:
X-Trans-Id:
Accept-Ranges: bytes
```