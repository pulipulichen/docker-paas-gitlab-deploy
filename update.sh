CURRENT_DIR=`pwd`
cd /app/docker-paas-gitlab-deploy/
git reset --hard
git pull --rebase

#cd /app/docker-paas-gitlab-deploy/scripts
cd $CURRENT_DIR