import tornado.web
import tornado.websocket
import tornado.httpserver
import tornado.ioloop

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    users = set()
    def check_origin(self, origin):
        return True
    
    def open(self):
        self.users.add(self)
        print "listener:",self
        pass

    def on_message(self, message):
        self.write_message(message)
        print "receive:", message

    def close(self):
        self.user.remove(self)
        pass

class IndexPageHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("websocket.html")


class Application(tornado.web.Application):
    def __init__(self):
        hadlers = [
            (r'/', IndexPageHandler),
            (r'/ws', WebSocketHandler)
            ]
        settings = {
            "template_path": 'static'
            }
        tornado.web.Application.__init__(self, hadlers, **settings)

if __name__ == '__main__':
    ws_app = Application()
    server = tornado.httpserver.HTTPServer(ws_app)
    server.listen(5000)
    tornado.ioloop.IOLoop.instance().start()
