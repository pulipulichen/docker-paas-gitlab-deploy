FROM cypress/included:9.6.0

RUN apt-get update
RUN apt-get install -y git

RUN mkdir /app
RUN git clone https://github.com/pulipulichen/docker-paas-gitlab-deploy.git

WORKDIR /app/docker-paas-gitlab-deploy
COPY package.json entrypoint.sh /app/docker-paas-gitlab-deploy/

#WORKDIR /app
RUN npm i

#RUN mkdir -p /app/scripts
#WORKDIR /app/scripts
#COPY scripts /app/scripts/

WORKDIR /app/docker-paas-gitlab-deploy/scripts/
#ENTRYPOINT [ "sh", "/app/docker-paas-gitlab-deploy/entrypoint.sh" ]w

ENTRYPOINT []
CMD []