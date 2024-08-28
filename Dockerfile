# Use an official Node runtime as the base image
FROM node:18.18.0

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies (this will also run the postinstall script)
RUN npm install

# Copy wait-for-it script
COPY wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client

# Copy the polyfill file
COPY global-polyfill.js ./

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Ensure Prisma files are generated and copied
RUN npm run init && \
  mkdir -p .output/server/node_modules/@magickml/server-db/src/lib/prisma/client-core/ && \
  find ./node_modules/@magickml/server-db/src/lib/prisma/client-core/ -type f \( -name "libquery_engine-*" -o -name "schema.prisma" \) -exec cp {} .output/server/node_modules/@magickml/server-db/src/lib/prisma/client-core/ \;

# Verify the files are copied
RUN ls -la .output/server/node_modules/@magickml/server-db/src/lib/prisma/client-core/

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application with the polyfill
CMD ["npm", "start"]

# cp ./node_modules/@magickml/server-db/src/lib/prisma/client-core/libquery_engine-linux-arm64-openssl-3.0.x.so.node .output/server/node_modules/@magickml/server-db/src/lib/prisma/client-core/
# cp ./node_modules/@magickml/server-db/src/lib/prisma/client-core/libquery_engine-linux-musl-openssl-3.0.x.so.node .output/server/node_modules/@magickml/server-db/src/lib/prisma/client-core/
# cp ./node_modules/@magickml/server-db/src/lib/prisma/client-core/* .output/server/node_modules/@magickml/server-db/src/lib/prisma/client-core/

# cp -R ./node_modules/@magickml/server-db/src/lib/prisma/client-core/* .output/server/node_modules/@magickml/server-db/src/lib/prisma/client-core/
# find ./node_modules/@magickml/server-db/src/lib/prisma/client-core/ -type f -not -name "*.prisma" -exec file {} + | grep -i "elf\|shared object" | awk '{print $1}' | sed 's/:$//' | xargs -I {} cp {} .output/server/node_modules/@magickml/server-db/src/lib/prisma/client-core/
