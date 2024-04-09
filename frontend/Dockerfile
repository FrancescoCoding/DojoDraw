# Stage 1: Build the application
FROM node:16 AS build

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of the frontend's source code into the Docker container
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with nginx (uses a smaller image so the final image is smaller)
FROM nginx:alpine

# Copy the build directory from the build stage to the nginx serve directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
