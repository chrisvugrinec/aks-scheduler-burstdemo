#!/bin/bash
echo "CONTAINER_NAME:"
read CONTAINER_NAME
echo "ACCOUNT_KEY:"
read ACCOUNT_KEY
echo "ACCOUNT_NAME:"
read ACCOUNT_NAME
echo "SP_NAME:"
read SP_NAME
echo "SP_PASSWORD:"
read SP_PASSWORD
echo "SP_TENANT:"
read SP_TENANT

echo "ok copy and paste this part in your secrets file:"


echo "    CONTAINER_NAME : " `echo $CONTAINER_NAME | base64`
echo "    ACCOUNT_KEY: " `echo $ACCOUNT_KEY | base64`
echo "    ACCOUNT_NAME: " `echo $ACCOUNT_NAME | base64`
echo "    SP_NAME: " `echo $SP_NAME | base64`
echo "    SP_PASSWORD: " `echo $SP_PASSWORD | base64`
echo "    SP_TENANT: " `echo $SP_TENANT | base64`
