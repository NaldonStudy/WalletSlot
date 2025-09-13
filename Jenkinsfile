pipeline {
    agent any

    stages {
        stage('Deploy') {
            steps {
                sshagent(['ec2-pem-key']) {
                    withCredentials([usernamePassword(
                        credentialsId: 'gitlab-registry',   // Jenkins에 저장해둔 GitLab 레지스트리 계정
                        usernameVariable: 'REG_USER',
                        passwordVariable: 'REG_PASS'
                    )]) {
                        sh '''
                            scp -o StrictHostKeyChecking=no -r \
                              Jenkinsfile docker-compose.yml nginx.conf walletslot-backend \
                              ubuntu@j13b108.p.ssafy.io:/home/ubuntu/walletslot

                            ssh -o StrictHostKeyChecking=no ubuntu@j13b108.p.ssafy.io "
                              echo $REG_PASS | docker login -u $REG_USER --password-stdin registry.gitlab.com &&
                              cd /home/ubuntu/walletslot &&
                              docker-compose down &&
                              docker-compose pull && 
                              docker-compose up -d
                            "
                        '''
                    }
                }
            }
        }
    }
}