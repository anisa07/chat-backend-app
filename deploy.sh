#!/bin/bash

# Check if required environment variables are set
if [ -z "$REMOTE_USER" ] || [ -z "$REMOTE_HOST" ] || [ -z "$REMOTE_DIR" ] || [ -z "$PM2_PROCESS_NAME" ]; then
  echo "One or more environment variables are missing."
  exit 1
fi

# Use the environment variables to perform operations
ssh ${REMOTE_USER}@${REMOTE_HOST} << EOF
  cd ${REMOTE_DIR}
  pm2 stop ${PM2_PROCESS_NAME}
  git pull origin main
  npm run build
  pm2 start ${PM2_PROCESS_NAME}
EOF
