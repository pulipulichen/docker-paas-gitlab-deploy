FROM cypress/included:9.6.0

RUN apt-get update
RUN apt-get install -y git

RUN apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb -y


# ==============

WORKDIR /tmp

RUN apt-get install -y curl
RUN curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
RUN chmod 700 get_helm.sh
RUN bash /tmp/get_helm.sh

# ==============


RUN mkdir /app -p
WORKDIR /app

#
RUN git clone https://github.com/pulipulichen/docker-paas-gitlab-deploy.git

WORKDIR /app/docker-paas-gitlab-deploy
COPY package.json /app/docker-paas-gitlab-deploy/

#WORKDIR /app
RUN npm i
RUN npm i -D cypress-repeat

#RUN mkdir -p /app/scripts
#WORKDIR /app/scripts
#COPY scripts /app/scripts/

WORKDIR /app/docker-paas-gitlab-deploy/scripts/
#ENTRYPOINT [ "sh", "/app/docker-paas-gitlab-deploy/entrypoint.sh" ]w

ENTRYPOINT []
CMD []

COPY scripts /app/docker-paas-gitlab-deploy/
COPY GitlabToDeploy.* RunCypress.* update.sh /app/docker-paas-gitlab-deploy/

WORKDIR /app/docker-paas-gitlab-deploy/scripts/
