import pyodbc
from config import SQL_SERVER_CONN_STR

def get_db():
    return pyodbc.connect(SQL_SERVER_CONN_STR)