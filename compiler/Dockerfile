FROM node:24-alpine
WORKDIR /compiler
RUN apk update && apk add --no-cache gcc g++ make python3 openjdk21-jdk
COPY . .
RUN npm install
EXPOSE 5175
CMD ["node", "index.js"]

