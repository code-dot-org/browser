#!/bin/bash

# Runs on Docker container, not locally

cd /project
curl -o- -L https://yarnpkg.com/install.sh | bash
yarn install
export USE_SYSTEM_SIGNCODE=false
export WIN_CSC_LINK=/project/config/codeorg-authenticode.p12
export SIGNTOOL_PATH=/project/config/osslsigncode
apt-get update
apt-get -y install sudo
sudo yarn win
