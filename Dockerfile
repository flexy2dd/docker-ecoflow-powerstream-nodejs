FROM node:latest

ENV NODE_ENV=development \
    KEY_MAIL=your_email_ecoflow_app \
    KEY_URL=cmd \
    KEY_PASSWORD=your_password_ecoflow_app \
    KEY_POWERSTREAM_SN=HW51xxxxxxxxxxxxx \
    KEY_QUERY_AC=ac_output_watt \
    KEY_QUERY_PRIO=power_supply_mode \
    TOKEN=my_token \
    TOKEN_VAL=my_secret_for_token

RUN apt-get update
RUN apt-get install -y nano git iproute2 htop

WORKDIR /usr/src/app

RUN git clone https://github.com/flexy2dd/ecoflow-powerstream-nodejs .
#RUN git clone https://github.com/bogdancs92/ecoflow-powerstream-nodejs .

RUN npm install --development

COPY server.js .

EXPOSE 8000

CMD ["node", "server.js"]
