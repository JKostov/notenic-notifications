#!/bin/sh

sshpass -p $DEPLOY_PASSWORD ssh -A travis@$DEPLOY_SERVER <<EOF
    cd $DEPLOY_DIR
    docker-compose up --force-recreate --no-deps -d notenic-notifications
    docker rmi -f jkostov/notenic-notifications:latest
    docker image prune -f
EOF
