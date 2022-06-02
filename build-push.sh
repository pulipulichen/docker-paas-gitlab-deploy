TAG=20220602-1130

REPO=docker-paas-gitlab-deploy

docker build -t pudding/$REPO:$TAG .
docker push pudding/$REPO:$TAG