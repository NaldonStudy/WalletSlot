pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                script {
                    // Dockerfile을 이용한 백엔드 이미지 빌드
                    sh "docker build -t backend-app-image ./walletslot-backend/"
                    // GitLab Container Registry에 로그인
                    withCredentials([string(credentialsId: 'gitlab-token', variable: 'CI_JOB_TOKEN')]) {
                        sh "docker login -u gitlab-ci-token -p ${CI_JOB_TOKEN} registry.gitlab.com"
                        // 빌드된 백엔드 이미지를 레지스트리에 푸시
                        sh "docker push backend-app-image"
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                sshagent(['ec2-pem-key']) {
                    // ssh로 서버에 접속하여 컨테이너 띄우기
                    sh '''
                        ssh -o StrictHostKeyChecking=no ubuntu@j13b108.p.ssafy.io "
                          cd /home/ubuntu/walletslot && 
                          docker-compose pull && 
                          docker-compose up -d --force-recreate && 
                          
                          while ! nc -z localhost 80; do
                            echo 'Waiting for Nginx container to be ready...'
                            sleep 1
                          done
                          
                          sudo certbot --nginx --agree-tos --email jeonhaejidev@gmail.com -n --no-eff-email
                        "
                    '''
                }
            }
        }
    }
}
