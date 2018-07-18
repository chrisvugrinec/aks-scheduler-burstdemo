#!/bin/bash

#echo "mysql password FROM INSTALL:"
#read install_password

echo "NEW mysql password :"
read new_password 

PODNAME=$(kubectl get pods -l app=mysql --no-headers | awk '{print $1}')
kubectl exec -it $PODNAME -- mysql --user=root --password=$new_password<<EOF
/*
ALTER USER 'root'@'localhost' IDENTIFIED BY $new_password;
FLUSH PRIVILEGES;
*/
#use mysql;
#update user set host='%' where user='root' and host='localhost';
#flush privileges;
create database cmdemo;
use cmdemo;
CREATE TABLE cmdemo (image VARCHAR(20), face VARCHAR(1), faceregtime FLOAT(8,4));
EOF
