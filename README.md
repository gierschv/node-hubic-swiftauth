Node hubiC Swift Authentification
=================================

**This script is unofficial and consequently not maintained by OVH.**

This script provides a simple Node.js HTTP server responding to a standard OpenStack Swift authentication request (v1.0).

For example:

```
$ HOST=127.0.0.1 PORT=3000 ./hubic-swiftauth.js &
$ curl -D - \
     -H "X-Auth-User: my-hubic-account@domain.tld" \
     -H "X-Auth-Key: my-hubic-password" \
     http://localhost:3000/v1.0
HTTP/1.1 204 No Content
X-Storage-Url: https://endpoint.hubic.ovh.net/v1/AUTH_00000000000000000000000000000000
X-Auth-Token: 00000000000000000000000000000000
Date: Tue, 22 Jan 2013 16:30:37 GMT
Connection: keep-alive
```

With Swift CLI:
```
$ swift -A http://localhost:8080/v1.0 -U my-hubic-account@domain.tld -K my-hubic-password stat
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