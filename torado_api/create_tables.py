from module import engine,Base

def run():
    Base.metadata.create_all(engine)