#!/bin/bash
docker kill mongo
docker rm mongo
docker run -d -p 27017:27017 -v "$PWD"/.db:/data/db --name mongo -d mongo:xenial
