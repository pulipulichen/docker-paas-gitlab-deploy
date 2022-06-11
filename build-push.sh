TAG=20220611-1615

REPO=docker-paas-gitlab-deploy

docker build -t pudding/$REPO:$TAG .
docker push pudding/$REPO:$TAG
docker image remove pudding/$REPO:$TAG -f