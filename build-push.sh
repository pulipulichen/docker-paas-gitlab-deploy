TAG=20220617-0143

REPO=docker-paas-gitlab-deploy

docker build -t pudding/$REPO:$TAG -t latest . && docker push pudding/$REPO:$TAG && docker rmi pudding/$REPO:$TAG