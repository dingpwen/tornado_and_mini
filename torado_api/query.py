from module import User, Token, Point, Bag, Recycle
from module import User, Token, Point, Bag, Recycle
from module import dbSession
from sqlalchemy import func
import time
import json
import redis

r = redis.Redis(host="localhost", port=6379)


class UserInfo:
    def __init__(self):
        pass

    @staticmethod
    def login(number, password):
        user = dbSession.query(User).filter(User.mobileNo == number, User.psw == password).first()
        if user is not None:
            token = user.id + time.mktime(time.localtime())
            user.token = token
            dbSession.commit()
            return user
        else:
            return None

    @staticmethod
    def insert(number, password):
        user = User("", password, "", number, 0, 0, 0, 0)
        dbSession.add(user)
        dbSession.commit()
        user = dbSession.query(User).filter(User.mobileNo == number).first()
        if user is not None:
            token = user.id + time.mktime(time.localtime())
            user.token = token
            tk = Token(token, User.name, user.id)
            dbSession.add(tk)
            dbSession.commit()
            return user
        else:
            return None

    @staticmethod
    def update(login_token, name, mobile_no, city_id, nh_id, address_id, identity):
        user = dbSession.query(User).filter(User.token == login_token).first()
        if user is not None:
            user.name = name
            user.mobileNo = mobile_no
            user.cityId = city_id
            user.nhId = nh_id
            user.addressId = address_id
            user.identity = identity
            dbSession.commit()
            return user
        else:
            return None

    @staticmethod
    def get_user_info(login_token):
        return dbSession.query(User).filter(User.token == login_token).first()


class PointsInfo:
    def __init__(self):
        pass

    @staticmethod
    def find_by_page(token, page_num, size):
        if page_num < 0:
            page_num = 0
        if size < 1:
            size = 2
        start = page_num * size
        end = start + size
        user = dbSession.query(User).filter(User.token == token).first()
        response = {"status": -1}
        if user is None:
            response["msg"] = "No score data"
            return response

        users = dbSession.query(func.count(Point.user_id), Point.user_id).filter(Point.user_id == user.id).all()
        count = users[0][0]
        print "count:", count
        if count == 0:
            response["msg"] = "No score data"
            return response

        pages = count / size
        if count % size != 0:
            pages += 1
        response["pageCount"] = pages
        points = dbSession.query(Point).filter(Point.user_id == user.id).slice(start, end).all()
        json_data = []
        for row in points:
            result = {"date": row.date, "way": row.way, "point": row.score}
            json_data.append(result)
        json_data_r = json.dumps(json_data, ensure_ascii=False)
        response["status"] = 200
        response["historyList"] = json_data_r
        return response


class BagsInfo:
    def __init__(self):
        pass

    @staticmethod
    def find_by_page(token, page_num, size):
        if page_num < 0:
            page_num = 0
        if size < 1:
            size = 2
        start = page_num * size
        end = start + size
        user = dbSession.query(User).filter(User.token == token).first()
        response = {"status": -1}
        if user is None:
            response["msg"] = "No score data"
            return response

        users = dbSession.query(func.count(Bag.user_id), Bag.user_id).filter(Bag.user_id == user.id).all()
        count = users[0][0]
        print "count:", count
        if count == 0:
            response["msg"] = "No score data"
            return response

        pages = count / size
        if count % size != 0:
            pages += 1
        response["pageCount"] = pages
        bags = dbSession.query(Bag).filter(Bag.user_id == user.id).slice(start, end).all()
        json_data = []
        for row in bags:
            result = {"date": row.date, "type": row.btype}
            json_data.append(result)
        json_data_r = json.dumps(json_data, ensure_ascii=False)
        response["status"] = 200
        response["historyList"] = json_data_r
        return response


class RecyclesInfo:
    def __init__(self):
        pass

    @staticmethod
    def find_by_page(token, page_num, size):
        if page_num < 0:
            page_num = 0
        if size < 1:
            size = 2
        start = page_num * size
        end = start + size
        user = dbSession.query(User).filter(User.token == token).first()
        response = {"status": -1}
        if user is None:
            response["msg"] = "No score data"
            return response

        users = dbSession.query(func.count(Recycle.user_id), Recycle.user_id).filter(
            Recycle.user_id == user.id).all()
        count = users[0][0]
        print "count:", count
        if count == 0:
            response["msg"] = "No score data"
            return response

        pages = count / size
        if count % size != 0:
            pages += 1
        response["pageCount"] = pages
        recycles =dbSession.query(Recycle).filter(Recycle.user_id == user.id).slice(start, end).all()
        json_data = []
        for row in recycles:
            result = {"date": row.date, "type": row.rtype, "weight": row.weight, "point": row.score}
            json_data.append(result)
        json_data_r = json.dumps(json_data, ensure_ascii=False)
        response["status"] = 200
        response["historyList"] = json_data_r
        return response


class TotalInfo:
    def __init__(self):
        pass

    @staticmethod
    def get_mine_counts(login_token):
        login_key = "loginToken:%s" % login_token
        user_id = r.get(login_key)
        if user_id is None:
            user = dbSession.query(User).filter(User.token == login_token).first()
            user_id = user.id
            r.set(login_key, user_id)
        response = {"status": -1}
        green_score_key = "greenScore:%s" % user_id
        green_score = r.get(green_score_key)
        if green_score is None:
            green_score = dbSession.query(func.sum(Point.score)).filter(Point.user_id == user_id).scalar()
            print "greenScore:", green_score
            if green_score is None:
                green_score = 0
            r.set(green_score_key, green_score)
        bag_key = "bagCount:%s" % user_id
        bag_count = r.get(bag_key)
        if bag_count is None:
            bag_count = dbSession.query(func.count(Bag.user_id)).filter(Bag.user_id == user_id).scalar()
            print "bagCount:", bag_count
            r.set(bag_key, bag_count)
        recycle_key = "recycleCount:%s" % user_id
        recycle_count = r.get(recycle_key)
        if recycle_count is None:
            recycle_count = dbSession.query(func.count(Recycle.user_id), Recycle.user_id).filter(
                Recycle.user_id == user_id).scalar()
            print "recycleCount:", recycle_count
        date_key = "startDate:%s" % user_id
        start_date = r.get(date_key)
        if start_date is None:
            point = dbSession.query(Point).filter(Point.user_id == user_id).order_by(Point.date).first()
            if point is not None:
                start_date = point.date
            else:
                start_date = "20151112"
        response["status"] = 200
        response["greenScore"] = green_score
        response["getBagCount"] = bag_count
        response["recoveryTimes"] = recycle_count
        response["startDate"] = start_date
        return response


