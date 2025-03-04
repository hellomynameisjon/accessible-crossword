# Accessible Crossword App

An accessible crossword puzzle application designed for users with visual impairments, featuring voice control and screen reader support.

## Features

- Voice control for navigation and input
- Screen reader optimized interface
- Sound effects for feedback
- Keyboard shortcuts for all actions
- High contrast mode support
- Responsive design for all devices

## Local Development

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/accessible-crossword.git
   cd accessible-crossword/accessible-crossword-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Building for Production

To create a production build:

```
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Deployment to DigitalOcean

### Option 1: Manual Deployment

1. Create a new Ubuntu droplet on DigitalOcean.

2. SSH into your droplet:
   ```
   ssh root@your-droplet-ip
   ```

3. Clone the repository:
   ```
   git clone https://github.com/yourusername/accessible-crossword.git /opt/accessible-crossword
   cd /opt/accessible-crossword/accessible-crossword-app
   ```

4. Run the deployment script:
   ```
   chmod +x deploy.sh
   ./deploy.sh
   ```

5. Your application should now be accessible at `http://your-droplet-ip`.

### Option 2: Using DigitalOcean App Platform

1. Push your code to a GitHub repository.

2. In the DigitalOcean dashboard, go to "Apps" and click "Create App".

3. Connect your GitHub repository.

4. Configure the app:
   - Set the source directory to `/accessible-crossword-app`
   - Set the build command to `npm run build`
   - Set the output directory to `dist`

5. Deploy the app.

## Setting Up a Domain Name

1. Purchase a domain name from a domain registrar.

2. In the DigitalOcean dashboard, go to "Networking" > "Domains".

3. Add your domain and create an A record pointing to your droplet's IP address.

4. Update your Nginx configuration to use your domain name:
   ```
   server_name yourdomain.com www.yourdomain.com;
   ```

5. Set up SSL with Let's Encrypt:
   ```
   apt-get install certbot python3-certbot-nginx
   certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

## Accessibility Features

- **Voice Control**: Toggle with the 'V' key or the microphone button
- **Sound Effects**: Toggle with the 'S' key or the sound button
- **Keyboard Shortcuts**:
  - Next clue: Right arrow
  - Previous clue: Left arrow
  - Read clue: Space
  - Help: 'H' key

## License

[MIT](LICENSE) 