# Use the official Node.js image as a base
FROM node:16 as builder

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies 
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of the backend's source code and the .env file into the Docker container
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Start a new stage to keep the final image small
FROM node:16-alpine

# Set the working directory in this new stage
WORKDIR /usr/src/app

# Copy package.json and package-lock.json again
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the built JavaScript code and the .env file from the 'builder' stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/.env ./

# Expose port 3000
EXPOSE 3000

# Command to run the application
CMD [ "node", "dist/index.js" ]

# trigger workflow test