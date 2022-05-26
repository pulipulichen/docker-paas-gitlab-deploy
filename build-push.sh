TAG=20220526-2013 

REPO=docker-paas-gitlab-deploy

docker build -t pudding/$REPO:$TAG .
docker push pudding/$REPO:$TAG