#!/bin/bash

# Exit on error
set -e

# Default domain is localhost if not provided
DOMAIN=${1:-localhost}
PROTOCOL=${2:-http}

# Function to check if the application is running
check_app() {
  echo "Checking if the application is running..."
  
  # Check if the application is accessible
  STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" $PROTOCOL://$DOMAIN)
  
  if [ $STATUS_CODE -eq 200 ]; then
    echo "✅ Application is running (Status code: $STATUS_CODE)"
  else
    echo "❌ Application is not running properly (Status code: $STATUS_CODE)"
  fi
}

# Function to check Docker containers
check_containers() {
  echo "Checking Docker containers..."
  
  # Check if the container is running
  if docker ps | grep -q accessible-crossword-app; then
    echo "✅ Container is running"
    
    # Get container stats
    echo "Container stats:"
    docker stats accessible-crossword-app --no-stream
  else
    echo "❌ Container is not running"
    
    # Check if the container exists but is stopped
    if docker ps -a | grep -q accessible-crossword-app; then
      echo "Container exists but is stopped. Starting it..."
      docker start accessible-crossword-app
    else
      echo "Container does not exist. Please deploy the application first."
    fi
  fi
}

# Function to check system resources
check_system() {
  echo "Checking system resources..."
  
  # Check CPU usage
  CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')
  echo "CPU Usage: $CPU_USAGE%"
  
  # Check memory usage
  MEM_USAGE=$(free -m | awk 'NR==2{printf "%.2f%%", $3*100/$2}')
  echo "Memory Usage: $MEM_USAGE"
  
  # Check disk usage
  DISK_USAGE=$(df -h / | awk 'NR==2{print $5}')
  echo "Disk Usage: $DISK_USAGE"
}

# Main function
main() {
  echo "=== Accessible Crossword App Monitoring ==="
  echo "Domain: $PROTOCOL://$DOMAIN"
  echo "Date: $(date)"
  echo "=================================="
  
  check_app
  echo "=================================="
  check_containers
  echo "=================================="
  check_system
  echo "=================================="
  
  echo "Monitoring completed."
}

# Run the main function
main 