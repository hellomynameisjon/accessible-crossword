#!/bin/bash

# Exit on error
set -e

# Check if domain name is provided
if [ -z "$1" ]; then
  echo "Usage: $0 yourdomain.com [www.yourdomain.com]"
  exit 1
fi

DOMAIN=$1
WWW_DOMAIN=$2

# Install Certbot
echo "Installing Certbot..."
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Update Nginx configuration with domain name
echo "Updating Nginx configuration..."
sed -i "s/server_name localhost;/server_name $DOMAIN $WWW_DOMAIN;/" /etc/nginx/conf.d/default.conf

# Reload Nginx to apply changes
echo "Reloading Nginx..."
nginx -t
systemctl reload nginx

# Obtain SSL certificate
echo "Obtaining SSL certificate..."
if [ -z "$WWW_DOMAIN" ]; then
  certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email your-email@example.com
else
  certbot --nginx -d $DOMAIN -d $WWW_DOMAIN --non-interactive --agree-tos --email your-email@example.com
fi

# Set up auto-renewal
echo "Setting up auto-renewal..."
echo "0 0,12 * * * root python -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" | tee -a /etc/crontab > /dev/null

echo "SSL setup completed successfully!"
echo "Your application should now be accessible at https://$DOMAIN" 