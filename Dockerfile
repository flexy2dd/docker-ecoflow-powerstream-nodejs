FROM node:latest

ENV NODE_ENV=development \
    ACCOUNT_MAIL=your_email_ecoflow_app \
    ACCOUNT_PASSWORD=your_password_ecoflow_app \
    POWER_MAX=800

RUN apt-get update
RUN apt-get install -y nano git htop

WORKDIR /usr/src/app

RUN git clone https://github.com/bogdancs92/ecoflow-powerstream-nodejs .

RUN npm install --development

COPY server.js .

EXPOSE 8000

CMD ["node", "server.js"]
