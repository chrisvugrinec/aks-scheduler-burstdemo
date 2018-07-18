#!/bin/bash

containeraccount="cyclodemo2account"
containername="cyclodemo2container"

#az storage account create -g cyclodemo2 -n $containeraccount
#az storage container create --name $containername --account-name $containeraccount

accountkey=$(az storage account keys list -g cyclodemo2 -n cyclodemo2account --query "[].value")

echo "ACCOUNT_NAME : "$containeraccount
echo "CONTAINER_NAME: "$containername
echo "ACCOUNT_KEY "$accountkey

