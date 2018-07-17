import sys
import numpy as np
import cv2
from PIL import Image
import glob
import os
import socket
import time
import datetime
import requests
import urllib.parse
import urllib
from urllib import request
import platform
from subprocess import call
import pymysql


counter = 0
hostname = platform.node()
start_time = datetime.datetime.utcnow()
CONTAINER_NAME = os.environ['CONTAINER_NAME']
ACCOUNT_KEY = os.environ['ACCOUNT_KEY']
ACCOUNT_NAME = os.environ['ACCOUNT_NAME']
SP_NAME = os.environ['SP_NAME']
SP_PASSWORD = os.environ['SP_PASSWORD']
SP_TENANT = os.environ['SP_TENANT']

# Initialize Azure connection
# Needed As the azure.blob python lib gave errors, workaround using the cli
def initAzure():
    call(["az","login","--service-principal","--username",SP_NAME,"--password",SP_PASSWORD,"--tenant",SP_TENANT])

# DB stuff
pymysql.install_as_MySQLdb()
import MySQLdb
db = MySQLdb.connect("mysql.default.svc.cluster.local","root","HelloWorld123!","cmdemo")
cursor = db.cursor()
insert_record = ("INSERT INTO cmdemo" "(image, face, faceregtime)" "VALUES (%s, %s, %s)")

# Method to detect faces
def detect(img, cascade, eyeCascade): 
    rects, eyes = [], []
    try:
        rects = cascade.detectMultiScale(img, scaleFactor=1.3, minNeighbors=4, minSize=(30, 30),flags=cv2.CASCADE_SCALE_IMAGE)
        print ("rects", rects)
        for (x,y,w,h) in rects:
            roi_gray = gray[y:y+h, x:x+w]
            eyes = eyeCascade.detectMultiScale(roi_gray)
            print("eyes:", eyes)
            if len(eyes):
                return True 
    except Exception as e:
        print(e)

    return False

initAzure()
while True:

    counter += 1
    filename = hostname+"-"+str(counter)+".jpg"

    f = open(filename,'wb')
    f.write(request.urlopen('https://r.sine.com/').read())
    f.close()

    img = cv2.imread(filename)


    # upload to blob storage
    call(["az","storage","blob","upload","--container-name", CONTAINER_NAME , "--file", filename ,"--name",filename ,"--account-key",ACCOUNT_KEY,"--account-name",ACCOUNT_NAME])

    if img is None:
        print("Image is none!")
        continue

    process_start_time = datetime.datetime.utcnow()
    cascade = cv2.CascadeClassifier('./haarcascade_frontalface_default.xml')
    eyeCascade = cv2.CascadeClassifier('./haarcascade_eye.xml')
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    face = detect(gray, cascade, eyeCascade)
    detect_end_time = datetime.datetime.utcnow()
    print("face found:" + str(face) + " in: ", filename, " spend:" + str((detect_end_time - process_start_time).total_seconds()))
    try:
        data_cmdemo = (filename, str(face)[0][0], (detect_end_time - process_start_time).total_seconds())
        cursor.execute(insert_record, data_cmdemo)
        db.commit()
        # cleanup
        os.remove(filename)
    except Exception as e:
        print(e)
        cursor.close()
        db.close()
