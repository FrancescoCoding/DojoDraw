# Ensure the script is run as root (adapted from https://askubuntu.com/questions/15853/how-can-a-script-check-if-its-being-run-as-root)
if [ "$(id -u)" != "0" ]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

# Step 1: Update and Upgrade the Server
echo "Updating and upgrading the server..."
sudo apt-get update && sudo apt-get upgrade -y

# Step 2: Install Docker
echo "Installing Docker..."
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update && sudo apt-get install -y docker-ce

# Step 3: Install Docker Compose
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Step 4: Clone the DojoDraw Project
echo "Cloning the DojoDraw project..."
git clone https://github.com/RobertGordonUniversity/coursework-FrancescoCoding
cd coursework-FrancescoCoding

# Step 5: Setup Environment Variables
echo "Please set up your environment variables now in the ./backend/ directory."
echo "A .env.example file is provided for reference. Rename it to .env and fill in your values."
read -p "Press enter to continue once you have configured your .env file..."

# Check if .env file exists after user input (adapted from https://stackoverflow.com/questions/638975/how-do-i-tell-if-a-regular-file-does-not-exist-in-bash)
if [ ! -f ".env" ]; then
    echo "Error: .env file not found. Please ensure you have renamed .env.example to .env and filled in your values."
    exit 1
fi

# Step 5: Start the Web Server
echo "Starting the web server..."
docker-compose up -d

echo "Setup completed. The web server is now running."
