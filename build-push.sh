TAG=20220513-2005

REPO=gitlab-to-deploy

docker build -t pudding/$REPO:$TAG .
docker push pudding/$REPO:$TAG