# 🖥️ Web Server Setup Guide

This guide provides instructions for setting up the web server on a fresh Ubuntu server. It covers the installation of Docker and Docker Compose. The installation of Node.js and other dependencies such as npm packages are handled by Docker, as specified in the Dockerfiles for both the frontend and backend. For example, both Dockerfiles use the `node:16` image as a base, ensuring that Node.js is available without requiring a separate installation on the host system. Additionally, dependencies are installed within the containers using `RUN npm install`, eliminating the need for Node.js and npm on the Ubuntu server outside of Docker. This approach focuses on Docker as the primary requirement for running DojoDraw.

> ⚠️ **Disclaimer:** Please note that this local setup utilises a connection URI for MongoDB Atlas, specified within the environment variables to enhance security. Due to the firewall settings on the Robert Gordon University (RGU) network, this local setup might not work as expected when connected to the RGU network. For convenience and to ensure accessibility, a live version of this application is hosted on the [live link](https://dojodraw.netlify.app/) below. This ensures that you can evaluate and interact with the application without facing connectivity issues imposed by network restrictions.

## 🌐 [DojoDraw Live link](https://dojodraw.netlify.app/) (hosted on Netlify & Google Cloud)

## 📋 Prerequisites

- A fresh Ubuntu server
- Root or sudo access

## 🚀 Automatic Setup Instructions

You can automatically download and run the setup script using the following command. This command will download the `setup.sh` script, make it executable, and then run it, performing all necessary setup steps.

```bash
curl -o setup.sh https://raw.githubusercontent.com/FrancescoCoding/DojoDraw/main/setup.sh?token=<get-from-owner> && chmod +x setup.sh && sudo ./setup.sh
```

## 🔧 Post-Setup

After completing the setup steps, the web server should be running. You can verify its status by accessing the server's IP address on the configured ports.

With the current setup, ports so far are:

- http://localhost:5173/ Frontend
- http://localhost:3000/ Backend

## 🛠️ Manual Setup Instructions

If the automatic setup encounters problems, switching to the manual instructions allows for detailed troubleshooting of each step. This method helps pinpoint and resolve issues more effectively.

### Step 1: Update the Server

Ensuring the package lists and installed packages are up to date by running the following commands in the Ubuntu terminal.

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### Step 2: Install Docker

Install Docker to manage the containers.

```bash
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce
```

### Step 3: Install Docker Compose

Install Docker Compose to manage multi-container Docker applications.

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 4: Clone the DojoDraw Project

Clone the project repository from GitHub.

```bash
git clone https://github.com/FrancescoCoding/DojoDraw
cd coursework-FrancescoCoding
```

### Step 5: Set Up Environment Variables

Rename the `.env.example` file to `.env` in the`backend` directory.
To maintain security, the `.env` file is not included in the repository.
The only thing missing is the MONGO_URI <PASSWORD>, which is the connection URI for MongoDB Atlas.
This will need to be obtained by the project owner and added to the `.env` file.

You can also create a different database and add the connection URI to the `.env` file. This will allow you to run the application with your own database, as all the necessary collections will be created automatically.

```bash
SERVER_PORT=8080
MONGO_URI=mongodb+srv://francesco:<PASSWORD>@cluster0.zcq46lg.mongodb.net/DojoDraw
NODE_ENV=development
```

### Step 6: Start the Web Server

Use Docker Compose to build and start the web server.

```bash
docker-compose up -d
```
