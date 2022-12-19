FROM node
WORKDIR /app
COPY package.json .
RUN npm install
EXPOSE 5000
CMD ["npm", "start"]
