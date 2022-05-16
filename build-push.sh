TAG=20220516-1617

REPO=docker-paas-gitlab-deploy

docker build -t pudding/$REPO:$TAG .
docker push pudding/$REPO:$TAG