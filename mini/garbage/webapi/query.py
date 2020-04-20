from module import User, Token, Point, Bag, Recycle
from config import db
import time
import json
import redis

r = redis.Redis(host="localhost", port=6379)

class UserInfo():
    def login(self, number, password):
        user = User.query.filter(User.mobileNo == number, User.psw == password).first()
        if user is not None:
            token = user.id + time.mktime(time.localtime())
            user.token = token
            db.session.commit()
            return user
        else :
            return None
        
    def insert(self, number, password):
        user = User("", password, "", number, "", "", 0)
        db.session.add(user)
        db.session.commit()
        user = User.query.filter(User.mobileNo == number).first()
        if user is not None:
            token = user.id + time.mktime(time.localtime())
            user.token = token
            tk = Token(token, User.name, user.id)
            db.session.add(tk)
            db.session.commit()
            return user
        else:
            return None

    def update(self, loginToken, name, mobileNo, ra, address, identity):
        user = User.query.filter(User.token == loginToken).first()
        if user is not None:
            user.name = name
            user.mobileNo = mobileNo
            user.ra = ra
            user.address = address
            user.identity = identity
            db.session.commit()
            return user
        else:
            return None

    def getUserInfo(self, loginToken):
        return User.query.filter(User.token == loginToken).first()
        

class PointsInfo():
    def findByPage(self, token, pageNum, size):
        if pageNum < 0:
            pageNum = 0
        if size < 1:
           size = 2
        start = pageNum * size
        end = start + size
        user = User.query.filter(User.token == token).first()
        response = {"status":-1}
        if user is None:
            response["msg"] = "No score data"
            return response

        
        users = db.session.query(db.func.count(Point.user_id), Point.user_id).filter(Point.user_id == user.id).all()
        count = users[0][0]
        print "count:", count
        if count == 0:
            response["msg"] = "No score data"
            return response

        pages = count/size
        if count%size != 0:
            pages += 1
        response["pageCount"] = pages
        points = Point.query.filter(Point.user_id == user.id).slice(start,end).all()
        jsonData = []
        for row in points:
            result = {}
            result["date"] = row.date
            result["way"] = row.way
            result["point"] = row.score
            jsonData.append(result)
        jsondatar=json.dumps(jsonData,ensure_ascii=False)
        response["status"] = 200
        response["historyList"] = jsondatar
        return response

class BagsInfo():
    def findByPage(self, token, pageNum, size):
        if pageNum < 0:
            pageNum = 0
        if size < 1:
           size = 2
        start = pageNum * size
        end = start + size
        user = User.query.filter(User.token == token).first()
        response = {"status":-1}
        if user is None:
            response["msg"] = "No score data"
            return response

        
        users = db.session.query(db.func.count(Bag.user_id), Bag.user_id).filter(Bag.user_id == user.id).all()
        count = users[0][0]
        print "count:", count
        if count == 0:
            response["msg"] = "No score data"
            return response

        pages = count/size
        if count%size != 0:
            pages += 1
        response["pageCount"] = pages
        bags = Bag.query.filter(Bag.user_id == user.id).slice(start,end).all()
        jsonData = []
        for row in bags:
            result = {}
            result["date"] = row.date
            result["type"] = row.btype
            jsonData.append(result)
        jsondatar=json.dumps(jsonData,ensure_ascii=False)
        response["status"] = 200
        response["historyList"] = jsondatar
        return response

class RecyclesInfo():
    def findByPage(self, token, pageNum, size):
        if pageNum < 0:
            pageNum = 0
        if size < 1:
           size = 2
        start = pageNum * size
        end = start + size
        user = User.query.filter(User.token == token).first()
        response = {"status":-1}
        if user is None:
            response["msg"] = "No score data"
            return response

        
        users = db.session.query(db.func.count(Recycle.user_id), Recycle.user_id).filter(Recycle.user_id == user.id).all()
        count = users[0][0]
        print "count:", count
        if count == 0:
            response["msg"] = "No score data"
            return response

        pages = count/size
        if count%size != 0:
            pages += 1
        response["pageCount"] = pages
        recycles = Recycle.query.filter(Recycle.user_id == user.id).slice(start,end).all()
        jsonData = []
        for row in recycles:
            result = {}
            result["date"] = row.date
            result["type"] = row.rtype
            result["weight"] = row.weight
            result["point"] = row.score
            jsonData.append(result)
        jsondatar=json.dumps(jsonData,ensure_ascii=False)
        response["status"] = 200
        response["historyList"] = jsondatar
        return response

class TotalInfo():
    @staticmethod
    def getMineCounts(loginToken):
        loginKey = "loginToken:%s" % loginToken
        userid = r.get(loginKey)
        if userid is None:
            user = User.query.filter(User.token == loginToken).first()
            userid = user.id
            r.set(loginKey, userid)
        response = {"status":-1}
        greenScoreKey = "greenScore:%s" % userid
        greenScore = r.get(greenScoreKey)
        if greenScore is None:
            greenScore = db.session.query(db.func.sum(Point.score)).filter(Point.user_id == userid).scalar()
            print "greenScore:", greenScore
            if greenScore is None:
                greenScore = 0
            r.set(greenScoreKey, greenScore)
        bagKey = "bagCount:%s" % userid
        bagCount = r.get(bagKey)
        if bagCount is None:
            bagCount = db.session.query(db.func.count(Bag.user_id)).filter(Bag.user_id == userid).scalar()
            print "bagCount:", bagCount
        recycleKey = "recycleCount:%s" % userid
        recycleCount = r.get(recycleKey)
        if recycleCount is None:
            recycleCount = db.session.query(db.func.count(Recycle.user_id), Recycle.user_id).filter(Recycle.user_id == userid).scalar()
            print "recycleCount:", recycleCount
        dateKey = "startDate:%s" % userid
        startDate = r.get(dateKey)
        if startDate is None:
            point = Point.query.filter(Point.user_id == userid).order_by(Point.date).first()
            if point is not None:
                startDate = point.date
            else :
                startDate = "20151112"
        response["status"] = 200
        response["greenScore"] = greenScore
        response["getBagCount"] = bagCount
        response["recoveryTimes"] = recycleCount
        response["startDate"] = startDate
        return response
            
        
