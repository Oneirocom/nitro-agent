# Use an official Node runtime as the base image
FROM node:18.18.0

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

RUN npm run init

# Copy the polyfill file
COPY global-polyfill.js ./

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application with the polyfill
CMD ["npm", "start"]