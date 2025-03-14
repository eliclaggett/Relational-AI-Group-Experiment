#!/bin/bash

################################################################################
# Filename: start.sh
# Author: Elijah Claggett
# Date: January 24, 2024
# Description: Starts an Empirica experiment alongside a Python websocket server
#
# Usage:
#   ./start.sh
#
# Dependencies:
#   - Empirica
#   - Python 3
#   - Pyenv
#   - Pyenv Virtualenv
#
# Notes:
#   Please create a .env file in the same directory as this script with the following variables defined accordingly:
#       - DEPLOYMENT (dev or prod)
#       - PORT_EMPIRICA (e.g. 9600)
#       - PORT_PYTHON (e.g. 9601)
#       - DATA_DIR (full path for the location that tajriba.json should be stored, e.g., /home/ubuntu/{user}/data)
#       - VENV (pyenv virtualenv name)
#
################################################################################

# Kill previously running experiment
if test -f RUNNING_PID
then
kill `cat RUNNING_PID`
fi

echo $$ > RUNNING_PID

current_dir=$(pwd)
dt=$(date +"%F_%T")

# Load .env variables
set -a            
source .env
set +a

# Load pyenv and pyenv-virtualenv
export PYENV_ROOT="$HOME/.pyenv"
command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$pth"
eval "$(pyenv init -)"
if which pyenv-virtualenv-init > /dev/null; then eval "$(pyenv virtualenv-init -)"; fi

# Finished loading, start running
if test -f "${EXPERIMENT_DIR}/.empirica/local/tajriba.json"
then
echo "Removing extraneous tajriba.json file..."
rm "${EXPERIMENT_DIR}/.empirica/local/tajriba.json"
fi

echo "Running Empirica in '${DEPLOYMENT}' mode"

# Run Empirica
if [ "$DEPLOYMENT" == "dev" ]
then
    { empirica serve "${EXPERIMENT_NAME}.tar.zst" -s ":${PORT_EMPIRICA}" & }
    pid1=$!
    echo "Empirica running with PID $pid1";
else
    { empirica serve "${EXPERIMENT_NAME}.tar.zst" -s ":${PORT_EMPIRICA}" --tajriba.store.file "${DATA_DIR}/tajriba-${dt}.json" > "$current_dir/log_empirica.log" 2>&1 & }
    pid1=$!
    echo "Empirica running with PID $pid1";
    echo "${DATA_DIR}/tajriba-${dt}.json";
fi

# Stop all child processes when we stop this script
function cleanup()
{
    kill -2 $pid1;
    echo "$pid1 stopped";
    rm log_*
    rm RUNNING_PID
    echo ''
    echo "Bye bye!"
}

# Keep script open until an interrupt is sent
trap cleanup EXIT
wait