#!/bin/bash

# Colors
GREEN="\e[32m"
YELLOW="\e[33m"
RED="\e[31m"
BLUE="\e[34m"
RESET="\e[0m"

# Variables
IMAGE_NAME="hrm-web-ui"
REGISTRY="registry.deepcare.vn"
REPO="deepcare/cis/hrm/hrm-web-ui"
TAG="dev-latest"

REMOTE_HOST="deepcare@10.8.0.184"
MODULE=${1:-$IMAGE_NAME}

echo -e "${BLUE} Checking Docker login status... ${RESET}"
if ! grep -q "$REGISTRY" ~/.docker/config.json 2>/dev/null; then
    echo -e "${YELLOW}Not logged in to $REGISTRY -> logging in...${RESET}"
    docker login $REGISTRY
else
    echo -e "${GREEN}Already logged in to $REGISTRY -> skipping login${RESET}"
fi

echo -e "${BLUE} Building Docker image [$IMAGE_NAME]... ${RESET}"
docker build --build-arg CI_ENVIRONMENT_SLUG=env --platform=linux/amd64 -t $IMAGE_NAME .

echo -e "${BLUE} Tagging image as $REGISTRY/$REPO:$TAG ${RESET}"
docker tag $IMAGE_NAME $REGISTRY/$REPO:$TAG

echo -e "${BLUE} Pushing image to $REGISTRY... ${RESET}"
docker push $REGISTRY/$REPO:$TAG

echo -e "${BLUE} Deploying module [$MODULE] on remote server... ${RESET}"
ssh $REMOTE_HOST "cd ~/projects/docker-engine && ./deploy-tool.sh $MODULE"

echo -e "${GREEN}✅ Deployment completed successfully!${RESET}"
