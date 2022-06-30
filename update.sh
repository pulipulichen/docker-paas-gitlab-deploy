CURRENT_DIR=`pwd`
cd /app/docker-paas-gitlab-deploy/
git reset --hard > /dev/null 2>&1
git pull --rebase > /dev/null 2>&1

#cd /app/docker-paas-gitlab-deploy/scripts
cd $CURRENT_DIR 