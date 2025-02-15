#!/bin/bash

DB_TAG="sowardssuites-$(date +%m-%d-%Y)"

rm -rf dump/$DB_TAG

mongodump --uri "$DATABASE_URL_PROD" --out dump/$DB_TAG

mongorestore --uri "mongodb://root:example@localhost:27017/sowardssuites?authSource=admin" --drop dump/$DB_TAG/sowardssuites
