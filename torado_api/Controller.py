import tornado.web
from query import UserInfo, TotalInfo, PointsInfo, BagsInfo, RecyclesInfo
from tornado.concurrent import run_on_executor
from concurrent.futures import ThreadPoolExecutor
from tornado import gen
import json

def error_request(msg):
    response = {"status": -1, "msg": msg}


def user_2_json(obj):
    return {
        "loginToken": obj.token,
        "name": obj.name,
        "mobileNo": obj.mobile_no,
        "cityId": obj.city_id,
        "nhId": obj.nh_id,
        "addressId": obj.address_id,
        "identity": obj.identity
    }


MAX_THREAD_NUM = 4


class AuthRequestHandler(tornado.web.RequestHandler):
    executor = ThreadPoolExecutor(max_workers=MAX_THREAD_NUM)

    def get(self, *args, **kwargs):
        self.write(error_request("Not support GET for auth/*"))

    @gen.coroutine
    def post(self, *args, **kwargs):
        path = self.request.path
        if path == '/auth/login':
            res = yield self.login(args, kwargs)
            self.write(res)
            self.finish()
        elif path == '/auth/register':
            res = yield self.register(args, kwargs)
            self.write(res)
            self.finish()
        else:
            self.write(error_request("Wrong path"))
        pass

    @run_on_executor
    def login(self, *args, **kwargs):
        print "login"
        number = self.get_argument("mobileNo")
        password = self.get_argument("pwd")
        print number, password
        response = {"status": 200}
        if number is None or password is None:
            response["status"] = -1
            response["msg"] = "number or password is null"
        else:
            user = UserInfo.login(number, password)
            if user is None:
                response["status"] = -1
                response["msg"] = "Fail to login"
            else:
                response["status"] = 200
                response["msg"] = "Query ok."
                response["loginToken"] = user.token
        return json.dumps(response, ensure_ascii=False)

    @run_on_executor
    def register(self, *args, **kwargs):
        print "register"
        # post_data = self.request.body_arguments
        number = self.get_argument("mobileNo")
        password = self.get_argument("pwd")
        sms_code = self.get_argument("smsCode")
        print number, password, sms_code
        response = {"status": 200}
        if number is None or password is None:
            response["status"] = -1
            response["msg"] = "number or password is null"
        else:
            user = UserInfo.insert(number, password)
            if user is None:
                response["status"] = -1
                response["msg"] = "Fail to register"
            else:
                response["status"] = 200
                response["loginToken"] = user.token
        return json.dumps(response, ensure_ascii=False)


class UserRequestHandler(tornado.web.RequestHandler):
    executor = ThreadPoolExecutor(max_workers=MAX_THREAD_NUM)

    @gen.coroutine
    def get(self, *args, **kwargs):
        path = self.request.path
        if path == '/user/getUserInfo':
            res = yield self.get_user_info(args, kwargs)
            self.write(res)
            self.finish()
        elif path == '/user/getMineData':
            try:
                res = yield self.get_mine_data(args, kwargs)
                self.write(res)
                self.finish()
            except Exception,e:
                print "Exception:", e
        elif path == '/user/updateUserInfo':
            res = yield self.update_user_info(args, kwargs)
            self.write(res)
            self.finish()
        else:
            self.write(error_request("Wrong path"))

    def post(self, *args, **kwargs):
        pass

    @run_on_executor
    def get_user_info(self, *args, **kwargs):
        token = self.get_argument("loginToken")
        response = {"status": 200}
        print token
        if token is None:
            response["status"] = -1
            response["msg"] = "loginToken is null"
        else:
            user = UserInfo.get_user_info(token)
            if user is None:
                response["status"] = -1
                response["msg"] = "Fail to login"
            else:
                response["status"] = 200
                response["userInfo"] = json.dumps(user, default=user_2_json)

        return json.dumps(response, ensure_ascii=False)

    @run_on_executor
    def get_mine_data(self, *args, **kwargs):
        login_token = self.get_argument("loginToken")
        print "login_token:", login_token
        response = TotalInfo.get_mine_counts(login_token)
        return json.dumps(response, ensure_ascii=False)

    @run_on_executor
    def update_user_info(self, *args, **kwargs):
        login_token = self.get_argument("loginToken")
        name = self.get_argument("name")
        mobile_no = self.get_argument("mobileNo")
        city_id = self.get_argument("cityId")
        nh_id = self.get_argument("nhId")
        address_id = self.get_argument("addressId")
        identity = self.get_argument("identity")
        print "login_token:", login_token
        user = UserInfo.update(login_token, name, mobile_no, city_id, nh_id, address_id, identity)
        response = {"status": 200}
        if user is None:
            response["status"] = -1
        return json.dumps(response, ensure_ascii=False)


class HistoryRequestHandler(tornado.web.RequestHandler):
    executor = ThreadPoolExecutor(max_workers=MAX_THREAD_NUM)

    @gen.coroutine
    def get(self, *args, **kwargs):
        path = self.request.path
        if path == '/score/getScoreHistory':
            res = yield self.get_score_history(args, kwargs)
            self.write(res)
            self.finish()
        elif path == '/garbagebag/getBagHistory':
            res = yield self.get_bag_history(args, kwargs)
            self.write(res)
            self.finish()
        elif path == '/recycle/getRecycleHistory':
            res = yield self.get_recycle_history(args, kwargs)
            self.write(res)
            self.finish()
        else:
            self.write(error_request("Wrong path"))

    @run_on_executor
    def get_score_history(self, *args, **kwargs):
        token = self.get_argument("loginToken")
        page = int(self.get_argument("page"))
        page_size = int(self.get_argument("pageSize"))
        print "page, pageSize:"
        print page, page_size
        response = PointsInfo.find_by_page(token, page, page_size)
        return json.dumps(response, ensure_ascii=False)

    @run_on_executor
    def get_bag_history(self, *args, **kwargs):
        token = self.get_argument("loginToken")
        page = int(self.get_argument("page"))
        page_size = int(self.get_argument("pageSize"))
        print "page, pageSize:"
        print page, page_size
        response = BagsInfo.find_by_page(token, page, page_size)
        return json.dumps(response, ensure_ascii=False)

    @run_on_executor
    def get_recycle_history(self, *args, **kwargs):
        token = self.get_argument("loginToken")
        page = int(self.get_argument("page"))
        page_size = int(self.get_argument("pageSize"))
        print "page, pageSize:"
        print page, page_size
        response = RecyclesInfo.find_by_page(token, page, page_size)
        return json.dumps(response, ensure_ascii=False)
