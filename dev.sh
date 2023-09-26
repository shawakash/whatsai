#!/bin/bash

# pulling the code 
git pull origin main

# Stop and remove the Docker Compose containers and volumes
sudo docker-compose down --volumes

# stoping the previous
sudo pm2 stop docker-compose

# runnig the compose
sudo pm2 start "docker-compose up" --name docker-compose
