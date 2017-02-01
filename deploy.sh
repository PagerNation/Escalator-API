#! /bin/bash

if [ "$TRAVIS_BRANCH" == "master" ]; then
  chmod 400 EscalatorAPI.pem
  tar -czf package.tgz dist
  scp -i EscalatorAPI.pem -o StrictHostKeyChecking=no package.tgz $DEPLOY_USER@$DEPLOY_HOST:~/
  ssh -i EscalatorAPI.pem -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST $DEPLOY_PATH/deploy.sh
fi