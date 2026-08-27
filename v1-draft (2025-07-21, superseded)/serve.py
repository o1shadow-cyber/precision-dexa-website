import http.server
import functools
import os

directory = os.path.dirname(os.path.abspath(__file__))
handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=directory)
http.server.test(HandlerClass=handler, port=4321)
