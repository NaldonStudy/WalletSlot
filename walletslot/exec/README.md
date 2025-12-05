## 포팅 매뉴얼 (Spring Boot + MySQL + Docker Compose + EC2 + React Native)
<hr />

### 1. 개요
백엔드: Spring Boot, MySQL <br />
프론트엔드: React Native (모바일 앱) <br />
배포환경: AWS EC2 (Docker Compose) <br />

### 2. 시스템 구성도
![시스템 아키텍처](../system_architecture.png)

### 3. 사전 준비물
OS: Ubuntu 20.04 / 22.04 (EC2 AMI 기준)
설치 필요: Docker, Docker Compose

### 4. 프로젝트 다운로드
git clone [Repository](https://lab.ssafy.com/s13-webmobile1-sub1/S13P11B204.git)

### 5. 환경 변수 설정
MYSQL_ROOT_PASSWORD=비밀번호
MYSQL_DATABASE=walletslotdb
MYSQL_USER=admin
MYSQL_PASSWORD=비밀번호
SPRING_PROFILES_ACTIVE=prod

DOCKER_REGISTRY=docker.io
DOCKER_REGISTRY_IMAGE=docker.io/jeonhaeji/b108-container-registry
DOCKER_REGISTRY_PASSWORD=dckr_pat_RQBoecXODEqwcTTJ_LdZInTRlDE
DOCKER_REGISTRY_USER=jeonhaeji
MYSQL_PASSWORD=dnxlachl
MYSQL_ROOT_PASSWORD=dnxlachl
MYSQL_USER=admin
SSH_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAokA7jSNoaByMY8/FaLJn1TNA7XAeFICt1Wksxh9hbNRFyCZB
F5hiCg6mjRVzCGglS0o56uSx1buo9Y9IjRUBJq7pEdU91O0/0oiqYKEsUVHdCsQI
Py+9Kfi+2LcRsZRJEfM1B3TYFQOyib9SFUef4yAhYtVaL/6Yxj/lKO5Hy7XXJKLh
aPzJ1p67hNOOQjjknsix/93vlc4kjE5xZe36n727j9VK+/SHf5kh8qXNLqBi+j+6
S3K/U/yHrvImuZVJ6HweImtj9PWSfUwPIhAencgAoiEvBZt9Mn91TWD/HoZIJ+AM
DAfbYqdhAxuwBH2PtAbzLyrFPkrlG5qq5Y2EWQIDAQABAoIBAAluFEf6s9nBNwOi
EsYoAFLq3K4wIv9sDy5lI34MWtw5Zijg2E2nxKLzAQkYIwxtCSXcFYuqaQ+UDZjg
EAZrHxsBdXhc3XAfreLtoIFnPK0pReCXTidl/eePln//+95HUQvjB8T8LIbkJR9O
aFXmSMuplWcqIUjC0lxLYGVFnBSh0DpJle7O/bYHSbkB9m+whk0IywANrXr+H7PV
8f5hOTXA+wNUF2s7yEXMG6mtqMg31KrSXqkUs6docO/lvj2DNw8cuhbqYUKV22ds
ujRxQO+MTtowkzKyj8/wrL4TFtSkL7KHfeJti6rA05xjPqcaGzNnUCg6I7v5fuhz
maRkjyUCgYEA11tLfP/qDtrrHS51SzPCQzCfNpMm5jWbimYWbXmTno08I57VTF9t
qaht4/dbzNpj2XTtHjCuTM3DLFh7iUfmYxh5K3CjRIdGWEaFFsqzbWMqrpVH/Kgb
KhfmHuvdlgKJPnacRre++F6qSD7EnLB0D1p7XaXTdG+HKLlKf689dBsCgYEAwN8y
aY8eY8+/Mfno0UtswGBPhS4qMoetE+9mVX5RHMNA9DLs21837cwe+qb8rgGHJavU
wv0JWsrFZcy0tQRwBcYlaa3I6t+HcLOkpqutyddDTOipQB/0KLp0/6FwzMx6j9x3
shzgGefLeMtoJNi5b0/D71vjP3XDm/4jId7cKJsCgYAnp+QKrIVJHv7UbM2kf29y
N+3Zetda5NwzbAENP6nzNEayuHjGi3wCFcXGiLIa0sw4KtPPD1/JPMqHy/NToC3I
aaVGXoNyBwbpEnNHcyP/LJebdlm/KKV35ta1MvGmwejL28ODMiq0SZpJm2VRBR0a
BqtY30RE2JSm5xfU00wZqQKBgCfoBo5AxpDwUycMBlgHuyCyzMFJpAGAgRc22X2m
/TFuVOox/0AEm5XgPiiulGmMd2IcA5G0uVLH0cAWcu1hVaxcKzGKe5/dUDDJeq/h
pbu1hn9LRHm4ItSqf7rEtIorZNCPVVTNFLFHfJopvAqjrPqTDn9gC8z9mNOV6b8A
VZ0xAoGAbZXobbj674uiHS1TkZv3cb/55sK5MpP89Ijo9Qq0U7NX9+6xRouME6fL
ZbQCzNg/3HanmYsbqEwxzX9sHGmJhGjv3Lh0hXcnx/ciWAL7fr7dqqBGsAzm5uhU
UODECZuc8wve4IeMIoXIgW77phKJ7y64Btu4RKDkg5lPXoSzNjI=
-----END RSA PRIVATE KEY-----
SPRING_DATASOURCE_URL=jdbc:mysql://mysql-db:3306/walletslotdb?serverTimezone=UTC&useSSL=false&allowPublicKeyRetrieval=true

### 6. Docker Compose 실행
docker-compose build
docker-compose up -d
docker ps 로 컨테이너 상태 확인
backend-app 과 mysql 컨테이너가 떠있어야 정상

### 7. 백엔드 접근
https://j13b108.p.ssafy.io/api
로그 확인: docker logs -f backend-app

### 8. 데이터베이스 초기화
schema.sql, seed date.sql 별도 첨부

### 9. 프론트엔드 실행 (React Native)
cd frontend
npm install
npx react-native start
npx react-native run-android