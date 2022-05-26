if [ ${ENABLE_PULL_UPDATE} ]; then
  sh /app/docker-paas-gitlab-deploy/update.sh
fi

ls /app/docker-paas-gitlab-deploy/
node /app/docker-paas-gitlab-deploy/GitlabToDeploy.js