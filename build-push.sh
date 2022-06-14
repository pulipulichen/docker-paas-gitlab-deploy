TAG=20220615-0325

REPO=docker-paas-gitlab-deploy

docker build -t pudding/$REPO:$TAG .
docker push pudding/$REPO:$TAG
docker rmi pudding/$REPO:$TAG