pipeline {
    agent any

    stages {
        stage('Deploy') {
            steps {
                sshagent(['ec2-pem-key']) {
                  sh '''
                    scp -o StrictHostKeyChecking=no -r * ubuntu@j13b108.p.ssafy.io:/home/ubuntu/walletslot
                    ssh -o StrictHostKeyChecking=no ubuntu@j13b108.p.ssafy.io "
                    echo GV45vnAqskRQTy79TYdj | docker login -u gitlab-ci-token --password-stdin registry.gitlab.com &&
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