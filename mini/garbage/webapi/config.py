from flask_sqlalchemy import SQLAlchemy
SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:315845@127.0.0.1:3306/garbage?charset=utf8mb4"
SQLALCHEMY_TRACK_MODIFICATIONS = False
db = SQLAlchemy()

