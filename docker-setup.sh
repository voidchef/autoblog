#!/bin/bash

# Autoblog Docker Setup Script
# This script helps set up the Docker environment for the first time

set -e  # Exit on error

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║   Autoblog Docker Setup               ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

# Check if Docker is installed
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
echo -e "${GREEN}✓ Docker Compose is installed${NC}"

# Check Docker daemon
if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker daemon is not running${NC}"
    echo "Please start Docker Desktop or the Docker daemon"
    exit 1
fi

echo -e "${GREEN}✓ Docker daemon is running${NC}"

# Create .env file if it doesn't exist
echo ""
echo -e "${BLUE}Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠ Please edit .env file with your configuration before starting${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Create necessary directories
echo ""
echo -e "${BLUE}Creating directories...${NC}"
mkdir -p data
mkdir -p uploads/profile-pictures
mkdir -p uploads/templates
mkdir -p backups
echo -e "${GREEN}✓ Directories created${NC}"

# Create docker-compose.override.yml if it doesn't exist
if [ ! -f docker-compose.override.yml ]; then
    echo ""
    echo -e "${BLUE}Creating docker-compose.override.yml template...${NC}"
    if [ -f docker-compose.override.yml.example ]; then
        cp docker-compose.override.yml.example docker-compose.override.yml
        echo -e "${GREEN}✓ docker-compose.override.yml created${NC}"
    fi
fi

# Check if pnpm is installed (optional, for local development)
echo ""
echo -e "${BLUE}Checking optional dependencies...${NC}"
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠ pnpm is not installed (optional for local development)${NC}"
    echo "  You can install it with: npm install -g pnpm"
else
    echo -e "${GREEN}✓ pnpm is installed${NC}"
fi

# Check if make is installed (optional)
if ! command -v make &> /dev/null; then
    echo -e "${YELLOW}⚠ make is not installed (optional, for convenient commands)${NC}"
    echo "  You can install it with your package manager"
else
    echo -e "${GREEN}✓ make is installed${NC}"
fi

# Summary
echo ""
echo -e "${BLUE}════════════════════════════════════${NC}"
echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${BLUE}════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Edit .env file with your configuration:"
echo -e "   ${BLUE}nano .env${NC}"
echo ""
echo "2. Start the development environment:"
if command -v make &> /dev/null; then
    echo -e "   ${BLUE}make dev${NC}"
else
    echo -e "   ${BLUE}docker-compose -f docker-compose.yml -f docker-compose.dev.yml up${NC}"
fi
echo ""
echo "3. Or start the production environment:"
if command -v make &> /dev/null; then
    echo -e "   ${BLUE}make prod${NC}"
else
    echo -e "   ${BLUE}docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d${NC}"
fi
echo ""
echo "4. Access the application:"
echo "   - Frontend: http://localhost:5173 (dev) or http://localhost:3000 (prod)"
echo "   - Backend API: http://localhost:3000"
echo "   - MongoDB: localhost:27018"
echo ""
echo -e "${BLUE}For more information, see:${NC}"
echo "   - DOCKER.md for comprehensive Docker documentation"
if command -v make &> /dev/null; then
    echo "   - Run 'make help' for all available commands"
fi
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
