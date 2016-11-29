#! /bin/bash

if [ "$TRAVIS_BRANCH" == "master" ]; then
  tar -czf package.tgz dist
  export SSHPASS=$DEPLOY_PASS
  sshpass -e scp package.tgz $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH
  sshpass -e ssh $DEPLOY_USER@$DEPLOY_HOST $DEPLOY_PATH/deploy.sh
fi