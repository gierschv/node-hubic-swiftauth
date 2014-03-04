# Node hubiC Swift Authentication

**This script is written for my personal usage, is unofficial and consequently
not maintained by OVH.**

This script provides a simple Node.js HTTP server responding to a standard
OpenStack Swift authentication request (v1.0) using the hubic OAuth API.
Tested with *Swift CLI* and *Cyberduck*.

### Usage

*  Create a hubiC application on hubic.com (My account > Your applications).

* Launch the script:
```
$ export APP_KEY=api_hubic_xxx
$ export APP_SECRET=42
$ export BASE_URL=https://example.com/
$ node hubic-swiftauth.js
```

* Go on the base url your specified (here https://example.com/), log in using
your hubiC credentials and you'll get this message:

```
Now you can use the Swift v1 API using these credentials:
	Endpoint: https://example.com/
	User: hubic
	Password: my-token

Example if you use the swift cli client:
	$ swift -A https://example.com/auth/v1.0 -U hubic -K my-token
```

* You can now use these credentials until you revoke them.
