#!/bin/bash

################################################################################
# Filename: test.sh
# Author: Elijah Claggett
# Date: January 24, 2024
# Description: Tests an Empirica experiment alongside a Python websocket server
#
# Usage:
#   ./test.sh
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

# Load .env variables
set -a            
source .env
set +a

# Activate python virtual environment
export PYENV_ROOT="$HOME/.pyenv"
command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$pth"
eval "$(pyenv init -)"
if which pyenv-virtualenv-init > /dev/null; then eval "$(pyenv virtualenv-init -)"; fi

# Remove Empirica cache
rm .empirica/local/tajriba.json

# Run Empirica
{ empirica -s ":9901" & }
pid1=$!
echo $pid1 >> RUNNING_PID

# Run NLP Server
# { ./deployment/run_nlp.command > log_nlp.log 2>&1 & }
# pid2=$!

function cleanup()
{
    # Cleanup child processes
    kill -SIGINT $pid1
    rm RUNNING_PID
    echo ''
    echo "Bye bye!"
}

trap cleanup SIGINT
wait