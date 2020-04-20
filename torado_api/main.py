import tornado.web
import tornado.httpserver
import tornado.ioloop
import tornado.websocket
from tornado.options import define, options
import create_tables
from Controller import AuthRequestHandler,UserRequestHandler, HistoryRequestHandler

define("tables", default=True, group="application", help="creat tables", type=bool)


class WebSocketHandler(tornado.websocket.WebSocketHandler):
    users = set()

    def __init__(self):
        pass

    def check_origin(self, origin):
        return True

    def open(self):
        self.users.add(self)
        print "add socket:",self
        pass

    def on_message(self, message):
        print 'receive:', message
        self.write_message("Hello")
        pass

    def close(self, **kwargs):
        self.users.remove(self)
        print "close socket:",self
        pass

    @classmethod
    def send_message(cls, msg):
        for user in WebSocketHandler.users:
            user.write_message(msg)


class MainApplication(tornado.web.Application):
    def __init__(self):
        urls = [
            (r'/auth/(.*)',AuthRequestHandler),
            (r'/user/(.*)', UserRequestHandler),
            (r'/garbagebag/getBagHistory', HistoryRequestHandler),
            (r'/recycle/getRecycleHistory', HistoryRequestHandler),
            (r'/score/getScoreHistory', HistoryRequestHandler),
            (r'/ws', WebSocketHandler)
        ]
        settings = {
            "template_path": 'static'
        }
        tornado.web.Application.__init__(self, urls, **settings)


if __name__ == '__main__':
    app = MainApplication()
    if options.tables:
        create_tables.run()
    server = tornado.httpserver.HTTPServer(app)
    server.listen(5000)
    tornado.ioloop.IOLoop.current().start()