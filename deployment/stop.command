#!/bin/bash

################################################################################
# Filename: start.command
# Author: Elijah Claggett
# Date: January 24, 2024
# Description: Stops the Empirica experiment on the server
#
# Usage:
#   ./deployment/stop.command
#
################################################################################

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")/../" ; pwd -P )
cd "$parent_path"

# Load dotenv
export $(cat .env | xargs)

ssh -i deployment/server.pem $SERVER_SSH bash << HERE
 cd $PROD_EXPERIMENT_DIR
 if test -f RUNNING_PID
 then
 kill -15 -\`cat ./RUNNING_PID\`
 rm nohup.out
 echo "Successfully stopped the experiment!";
 else
 echo "No experiment running!";
 fi
 exit
HERE