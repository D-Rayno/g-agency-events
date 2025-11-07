#!/bin/bash

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Database Debug Information           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

echo -e "${YELLOW}1. Checking .env.docker file...${NC}"
if [ -f .env.docker ]; then
    echo -e "${GREEN}✓ .env.docker exists${NC}"
    echo -e "\n${YELLOW}Database variables:${NC}"
    grep "DB_" .env.docker | grep -v "PASSWORD"
else
    echo -e "${RED}✗ .env.docker not found${NC}"
fi

echo -e "\n${YELLOW}2. Checking Docker volumes...${NC}"
docker volume ls | grep mysql

echo -e "\n${YELLOW}3. Checking container status...${NC}"
docker ps -a | grep g-agency

echo -e "\n${YELLOW}4. Database container logs (last 30 lines):${NC}"
docker logs g-agency-db --tail 30 2>&1

echo -e "\n${YELLOW}5. Checking MySQL port 3306...${NC}"
if lsof -i :3306 > /dev/null 2>&1; then
    echo -e "${RED}⚠️  Port 3306 is already in use:${NC}"
    lsof -i :3306
else
    echo -e "${GREEN}✓ Port 3306 is free${NC}"
fi

echo -e "\n${YELLOW}6. Checking local MySQL service...${NC}"
if systemctl is-active --quiet mysql; then
    echo -e "${RED}⚠️  Local MySQL is running!${NC}"
    echo -e "${YELLOW}   Run: sudo systemctl stop mysql${NC}"
else
    echo -e "${GREEN}✓ Local MySQL is stopped${NC}"
fi