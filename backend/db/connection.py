import pyodbc
import os
from dotenv import load_dotenv

load_dotenv() 

def get_db():
    conn_str = os.getenv('SQL_SERVER_CONN_STR')
    if not conn_str:
        raise ValueError("Lỗi: Biến môi trường SQL_SERVER_CONN_STR không được thiết lập hoặc trống.")
    return pyodbc.connect(conn_str)