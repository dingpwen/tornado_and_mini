# -*- coding: utf-8 -*-
from config import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, unique=True,autoincrement=True)
    name = db.Column(db.String(50))
    psw = db.Column(db.String(50))
    token = db.Column(db.String(100))
    mobileNo = db.Column(db.String(20))
    ra = db.Column(db.String(100))
    address = db.Column(db.String(100))
    identity = db.Column(db.String(100))
    def __init__(self, name, psw, token, mobileNo, ra, address, identity):
        self.name = name
        self.psw = psw
        self.token = token
        self.mobileNo = mobileNo
        self.ra = ra
        self.address = address
        self.identity = identity


    def __repr__(self):
        return '{loginToken:%s, name: %s, mobileNo: %s, ra: %s, address: %s, identity:%s}' % (self.token, self.name, self.mobileNo,self.ra,self.address,self.identity)
    

class Token(db.Model):
    __tablename__ = 'token'
    id = db.Column(db.Integer, primary_key=True)
    token_id= db.Column(db.String(100))
    user_id = db.Column(db.String(50))
    
    def __init__(self, token_id, user_name, user_id):
        self.token_id = token_id
        self.user_name = user_name
        self.user_id = user_id
    
    def __repr__(self):
        return '<Token %i %r %r %r>' % (self.id,self.token_id,self.user_name,self.user_id)


class Point(db.Model):
    __tablename__ = 'point'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100))
    date= db.Column(db.String(20))
    way = db.Column(db.String(50))
    score = db.Column(db.String(50))
    
    def __init__(self, user_id, date, way, score):
        self.user_id = user_id
        self.date = date
        self.way = way
        self.score = score
    
    def __repr__(self):
        return '{"date": %s, "way": %s, "point":%s}' % (self.date,self.way,self.score)

class Bag(db.Model):
    __tablename__ = 'bag'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100))
    date= db.Column(db.String(20))
    btype = db.Column(db.String(50))
    
    def __init__(self, user_id, date, btype):
        self.user_id = user_id
        self.date = date
        self.btype = btype
    
    def __repr__(self):
        return '<Token %i %r %r %r>' % (self.id,self.user_id,self.date,self.btype)

class Recycle(db.Model):
    __tablename__ = 'recycle'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100))
    date= db.Column(db.String(20))
    rtype = db.Column(db.String(50))
    weight = db.Column(db.String(50))
    score = db.Column(db.String(50))
    
    def __init__(self, user_id, date, rtype, weight, score):
        self.user_id = user_id
        self.date = date
        self.rtype = rtype
        self.weight = weight
        self.score = score
    
    def __repr__(self):
        return '<Token %i %r %r %r>' % (self.id,self.user_id,self.date,self.rtype,self.score)
