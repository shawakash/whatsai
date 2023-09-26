#!/bin/bash

# pulling the code 
git pull origin main

# Stop and remove the Docker Compose containers and volumes
sudo docker-compose down --volumes

# Start the Docker Compose services
sudo docker-compose up
