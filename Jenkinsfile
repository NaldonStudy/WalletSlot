pipeline {
    agent any

    stages {
        stage('Deploy') {
            steps {
                sshagent(['ec2-pem-key']) {
                    sh '''
                        scp -o StrictHostKeyChecking=no -r ./walletslot-backend ubuntu@j13b108.p.ssafy.io:/home/ubuntu/walletslot
                        ssh -o StrictHostKeyChecking=no ubuntu@j13b108.p.ssafy.io "
                          cd /home/ubuntu/walletslot &&
                          git pull origin dev-infra &&
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