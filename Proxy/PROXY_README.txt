To run the proxy for regular operation the proxy must be launched before the client but after the server.

run python smallproxy.python

when the terminal says "listening on ws:/localhost:8080" then the client can be started. For testing:

run python -m pytest

This will run the test_smallproxy_functionbased.py script which holds the unit tests for the proxy.