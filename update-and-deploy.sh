#!/bin/bash

if test -z "$REPO_HTTPS_ADDRESS" 
then
      echo "\$REPO_HTTPS_ADDRESS is required"
      exit 1
fi

if test -z "$PUBLISHER_EMAIL" 
then
      echo "\$PUBLISHER_EMAIL is required"
      exit 1
fi

if test -z "$PUBLISHER_USERNAME" 
then
      echo "\$PUBLISHER_USERNAME is required"
      exit 1
fi

git clone "$REPO_HTTPS_ADDRESS"
mv config.js oss-org-stats/
cd oss-org-stats
git config user.email "$PUBLISHER_EMAIL"
git config user.name "$PUBLISHER_USERNAME"

npm install
## Warm up github
node management/get-data.js
sleep 11s
## Warm up github
node management/get-data.js
sleep 13s
## This should now get all data
npm run import-data
npm run deploy
