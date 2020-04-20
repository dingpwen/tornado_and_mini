# -*- coding: utf-8 -*-
from sqlalchemy import create_engine
from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

engine = create_engine("mysql+pymysql://root:315845@127.0.0.1:3306/garbage",encoding='utf-8',echo=True)
Session = sessionmaker(bind=engine)
dbSession = Session()
Base = declarative_base(bind=engine)


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, unique=True,autoincrement=True)
    name = Column(String(50))
    psw = Column(String(50))
    token = Column(String(100))
    mobile_no = Column(String(20))
    city_id = Column(Integer)
    nh_id = Column(Integer)
    address_id = Column(Integer)
    identity = Column(Integer)

    def __init__(self, name, psw, token, mobile_no, city_id, nh_id, address_id, identity):
        self.name = name
        self.psw = psw
        self.token = token
        self.mobile_no = mobile_no
        self.city_id = city_id
        self.nh_id = nh_id
        self.address_id = address_id
        self.identity = identity


    def __repr__(self):
        return '{loginToken:%s, name: %s, mobileNo: %s, cityId: %s, nhId: %s, addressId: %s, identity:%s}' % (self.token, self.name, self.mobileNo,self.cityId,self.nhId,self.addressId,self.identity)
    

class Token(Base):
    __tablename__ = 'token'
    id = Column(Integer, primary_key=True)
    token_id= Column(String(100))
    user_id = Column(String(50))
    
    def __init__(self, token_id, user_name, user_id):
        self.token_id = token_id
        self.user_name = user_name
        self.user_id = user_id
    
    def __repr__(self):
        return '<Token %i %r %r %r>' % (self.id,self.token_id,self.user_name,self.user_id)


class Point(Base):
    __tablename__ = 'point'
    id = Column(Integer, primary_key=True)
    user_id = Column(String(100))
    date = Column(String(20))
    way = Column(String(50))
    score = Column(String(50))
    
    def __init__(self, user_id, date, way, score):
        self.user_id = user_id
        self.date = date
        self.way = way
        self.score = score
    
    def __repr__(self):
        return '{"date": %s, "way": %s, "point":%s}' % (self.date,self.way,self.score)

class Bag(Base):
    __tablename__ = 'bag'
    id = Column(Integer, primary_key=True)
    user_id = Column(String(100))
    date= Column(String(20))
    btype = Column(String(50))
    
    def __init__(self, user_id, date, btype):
        self.user_id = user_id
        self.date = date
        self.btype = btype
    
    def __repr__(self):
        return '<Token %i %r %r %r>' % (self.id,self.user_id,self.date,self.btype)

class Recycle(Base):
    __tablename__ = 'recycle'
    id = Column(Integer, primary_key=True)
    user_id = Column(String(100))
    date= Column(String(20))
    rtype = Column(String(50))
    weight = Column(String(50))
    score = Column(String(50))
    
    def __init__(self, user_id, date, rtype, weight, score):
        self.user_id = user_id
        self.date = date
        self.rtype = rtype
        self.weight = weight
        self.score = score
    
    def __repr__(self):
        return '<Token %i %r %r %r>' % (self.id,self.user_id,self.date,self.rtype,self.score)
