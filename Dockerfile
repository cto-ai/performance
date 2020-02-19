############################
# Build container
############################
FROM registry.cto.ai/official_images/node:latest

WORKDIR /ops
COPY package.json .
RUN npm install
COPY . .
