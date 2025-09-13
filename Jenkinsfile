pipeline {
    agent any

    stages {
        stage('Deploy') {
            steps {
                sshagent(['ec2-pem-key']) {
                  sh '''
                    ssh -o StrictHostKeyChecking=no ubuntu@j13b108.p.ssafy.io "
                    if [ ! -d /home/ubuntu/walletslot/.git ]; then
                      rm -rf /home/ubuntu/walletslot
                      git clone -b dev-infra https://lab.ssafy.com/s13-fintech-finance-sub1/S13P21B108.git /home/ubuntu/walletslot
                    else
                      cd /home/ubuntu/walletslot && git reset --hard && git pull origin dev-infra
                    fi

                    cd /home/ubuntu/walletslot &&
                    docker-compose down &&
                    docker-compose build &&
                    docker-compose up -d
                  "
                '''
                }
            }
        }
    }
}