FROM cypress/included:9.6.0

RUN apt-get update
RUN apt-get install -y git


RUN mkdir /app
WORKDIR /app

RUN echo "20220526-2038 "
RUN git clone https://github.com/pulipulichen/docker-paas-gitlab-deploy.git

WORKDIR /app/docker-paas-gitlab-deploy
COPY package.json /app/docker-paas-gitlab-deploy/

#WORKDIR /app
RUN npm i

#RUN mkdir -p /app/scripts
#WORKDIR /app/scripts
#COPY scripts /app/scripts/

WORKDIR /app/docker-paas-gitlab-deploy/scripts/
#ENTRYPOINT [ "sh", "/app/docker-paas-gitlab-deploy/entrypoint.sh" ]w

ENTRYPOINT []
CMD []

RUN apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb -y

COPY GitlabToDeploy.* RunCypress.* update.sh /app/docker-paas-gitlab-deploy/