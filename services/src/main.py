import os
import time
import datetime
import platform
import pymysql
from flask import Flask
from flask import Flask, render_template
from flask_cors import CORS
from flask import send_from_directory
start_time = datetime.datetime.utcnow()
import sys
import json
import logging

DB_HOST = os.environ['DB_HOST']
DB_PASSWORD = os.environ['DB_PASSWORD']

app = Flask(__name__)
CORS(app)

# DB stuff
pymysql.install_as_MySQLdb()
import MySQLdb
dbConnection = MySQLdb.connect(str(DB_HOST),"root",str(DB_PASSWORD),"cmdemo")
cursor = dbConnection.cursor()
count_query = ("SELECT count(1) from cmdemo")
countFaces_query = ("SELECT count(1) from cmdemo where face='T'")
countNonFaces_query = ("SELECT count(1) from cmdemo where face='F'")

@app.route("/api/cmdemo-counter")
def getstats():
    # total
    cursor.execute(count_query)
    counter = cursor.fetchone()
    # total faces
    cursor.execute(countFaces_query)
    counterFaces = cursor.fetchone()
    # total non faces
    cursor.execute(countNonFaces_query)
    counterNonFaces = cursor.fetchone()

    dbConnection.commit()
    return json.dumps({'counter': counter,'counterFaces': counterFaces, 'CounterNonFaces': counterNonFaces })

if __name__ == "__main__":
  app.run(host="0.0.0.0", debug=False)

