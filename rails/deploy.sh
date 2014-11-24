#!/bin/bash

cd ../ember && ember build --environment production --output-path ../rails/public
cd ../rails
git add .
git commit -am "Empty commit for Heroku deployment" --allow-empty
git push heroku master