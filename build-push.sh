TAG=20220528-0142

REPO=docker-paas-gitlab-deploy

docker build -t pudding/$REPO:$TAG .
docker push pudding/$REPO:$TAG