from node:17-alpine

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY . .
RUN npm ci && npm run build && npm install -g pm2 
EXPOSE 3000
CMD [ "pm2-runtime", "dist/server.js" ]