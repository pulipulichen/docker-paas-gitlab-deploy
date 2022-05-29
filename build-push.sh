TAG=20220529-1609

REPO=docker-paas-gitlab-deploy

docker build -t pudding/$REPO:$TAG .
docker push pudding/$REPO:$TAG