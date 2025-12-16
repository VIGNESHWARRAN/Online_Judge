FROM fiascode-compiler:latest
WORKDIR /compiler
RUN apk update && apk add --no-cache g++ python3 openjdk21-jdk
COPY . .
RUN npm install
EXPOSE 5175
CMD ["node", "index.js"]

