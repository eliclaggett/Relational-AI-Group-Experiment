#!/bin/bash

################################################################################
# Filename: deploy.command
# Author: Elijah Claggett
# Date: January 24, 2024
# Description: Deploys this Empirica experiment along with its associated files
#
# Usage:
#   ./deployment/deploy.command
#
# Dependencies:
#   - Empirica
#   - Python 3
#   - Pyenv
#   - Pyenv Virtualenv
#
# Notes:
#   Please run this file from the parent directory.
#
################################################################################

tput sc
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")/../" ; pwd -P )
cd "$parent_path"

# Load dotenv and ensure proper export
set -a
source .env
set +a

empirica bundle

echo $SERVER_SSH;
echo $PROD_EXPERIMENT_DIR;

sftp -b - -i deployment/server.pem $SERVER_SSH <<EOF
    put -r "$parent_path/$EXPERIMENT_NAME.tar.zst" "$PROD_EXPERIMENT_DIR"
    put "$parent_path/start.sh" "$PROD_EXPERIMENT_DIR/start.sh"
    put "$parent_path/.env_prod" "$PROD_EXPERIMENT_DIR/.env"
    put "$parent_path/texts.json" "$PROD_EXPERIMENT_DIR/texts.json"
    exit
EOF

tput rc
tput el
echo "Done deploying the experiment!";
