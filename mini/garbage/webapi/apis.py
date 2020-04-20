from flask import Flask
from flask import request,jsonify
from config import db
from module import Point
from query import PointsInfo, UserInfo, BagsInfo, RecyclesInfo, TotalInfo
import json

app = Flask(__name__)
app.config.from_object("config")

with app.app_context():
    db.init_app(app)
    db.create_all()

@app.route('/score/getScoreHistory', methods=['GET'])
def getScoreHistory():
    token = request.args.get("loginToken")
    page = int(request.args.get("page"))
    pageSize = int(request.args.get("pageSize"))
    print "page, pageSize:"
    print page, pageSize
    pInfo = PointsInfo()
    response = pInfo.findByPage(token, page, pageSize)
    return jsonify(response)

@app.route('/garbagebag/getBagHistory', methods=['GET'])
def getBagHistory():
    token = request.args.get("loginToken")
    page = int(request.args.get("page"))
    pageSize = int(request.args.get("pageSize"))
    print "page, pageSize:"
    print page, pageSize
    bInfo = BagsInfo()
    response = bInfo.findByPage(token, page, pageSize)
    return jsonify(response)

@app.route('/recycle/getRecycleHistory', methods=['GET'])
def getRecycleHistory():
    token = request.args.get("loginToken")
    page = int(request.args.get("page"))
    pageSize = int(request.args.get("pageSize"))
    print "page, pageSize:"
    print page, pageSize
    rInfo = RecyclesInfo()
    response = rInfo.findByPage(token, page, pageSize)
    return jsonify(response)

@app.route('/auth/register', methods=['POST'])
def register():
    number = None
    password = None
    smsCode = None
    try:
        data = json.loads(request.get_data(as_text=True))
        print "data:",data
        number = data.get("mobileNo")
        password = data.get("pwd")
        smsCode = data.get("smsCode")
    except ValueError:
        number = request.form.get("mobileNo")
        password = request.form.get("pwd")
        smsCode = request.form.get("smsCode")
    print number,password,smsCode
    response = {"status":200}
    if number is None or password is None:
        response["status"] = -1
        response["msg"] = "number or password is null"
    else :
        uinfo = UserInfo()
        userinfo = uinfo.insert(number, password)
        if userinfo is None:
            response["status"] = -1
            response["msg"] = "Fail to register"
        else :
            response["status"] = 200
            response["loginToken"] = userinfo.token

    return jsonify(response)
    
def user_2_json(obj):
    return {
        "loginToken": obj.token,
        "name": obj.name,
        "mobileNo": obj.mobileNo,
        "ra": obj.ra,
        "address": obj.address,
        "identity":obj.identity
        }

@app.route('/auth/login', methods=['POST'])
def login():
    number = None
    password = None
    try:
        data = json.loads(request.get_data(as_text=True))
        number = data.get("mobileNo")
        password = data.get("pwd")
    except ValueError:
        number = request.form.get("mobileNo")
        password = request.form.get("pwd")
    response = {"status":200}
    print number,password
    if number is None or password is None:
        response["status"] = -1
        response["msg"] = "number or password is null"
    else :
        uinfo = UserInfo()
        userinfo = uinfo.login(number, password)
        if userinfo is None:
            response["status"] = -1
            response["msg"] = "Fail to login"
        else :
            response["status"] = 200
            response["msg"] = "Query ok."
            response["loginToken"] = userinfo.token

    return jsonify(response)


@app.route('/user/getUserInfo', methods=['GET'])
def getUserInfo():
    token = request.args.get("loginToken")
    response = {"status":200}
    print token
    if token is None:
        response["status"] = -1
        response["msg"] = "loginToken is null"
    else :
        uinfo = UserInfo()
        userinfo = uinfo.getUserInfo(token)
        if userinfo is None:
            response["status"] = -1
            response["msg"] = "Fail to login"
        else :
            response["status"] = 200
            response["userInfo"] = json.dumps(userinfo, default=user_2_json)

    return jsonify(response)

@app.route('/user/updateUserInfo', methods=['POST'])
def updateUserInfo():
    #post = request.get_data()
    #datas = json.loads(post.decode("utf-8"))
    loginToken = request.form.get("loginToken")
    name = request.form.get("name")
    mobileNo = request.form.get("mobileNo")
    ra = request.form.get("ra")
    address = request.form.get("address")
    identity = request.form.get("identity")
    uinfo = UserInfo()
    print "loginToken:", loginToken
    userinfo = uinfo.update(loginToken,name,mobileNo,ra,address,identity)
    response = {"status":200}
    if userinfo is None:
        response["status"] = -1
    return jsonify(response)

@app.route('/user/getMineData', methods=['GET'])
def getMineData():
    loginToken = request.args.get("loginToken")
    print "loginToken:", loginToken
    response = TotalInfo.getMineCounts(loginToken)
    return jsonify(response)

if __name__ == "__main__":
    app.debug = app.config['DEBUG']
    app.run(host="0.0.0.0")
