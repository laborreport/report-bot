#!groovy
// Check ub1 properties
properties([disableConcurrentBuilds()])

pipeline {

    agent { 
        label 'master'
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '10')) //хранить логи 10 сборок и артефактов
        timestamps() //временные отметки 
    }

    environment{
        deployServerIp = '192.168.32.6'
        deployServerHostname = 'ganimed'
        deployServerCredential = 'ganimed'
        registryAddress = '192.168.32.4:5000'
        nameImage = 'report-bot'
        numberBuild = "${env.BUILD_NUMBER}"
    }
    stages {
        stage('Build and push images') {
            steps {
                script {
                    withCredentials([file(credentialsId: 'env_file', variable: 'ENV_FILE')]){
                        sh "cp ${ENV_FILE} ./.env"
                    }
                    docker.withRegistry("https://$registryAddress") {
                        def customImage = docker.build(nameImage,"-f .dockerfile .")
                        sh "rm .env"
                        customImage.push(numberBuild)
                        customImage.push("latest")
                    }
                }    
            }
        }
        
        stage('Remove docker images') {
            steps {
                sh "docker rmi -f $registryAddress/$nameImage:$numberBuild"
                sh "docker rmi -f $registryAddress/$nameImage:latest"
                sh "docker rmi -f $nameImage:$numberBuild"
                sh "docker rmi -f $nameImage:latest"
            }
        }

        stage("Deploy") {
            steps {
                script {
                    def remote = [:]
                    remote.name = deployServerHostname
                    remote.allowAnyHosts = true
                    node {
                        withCredentials([usernamePassword(credentialsId: deployServerCredential, usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                            remote.user = USERNAME
                            remote.host = deployServerIp
                            remote.password = PASSWORD
                            stage("Deploy docker container") {
                                sh "docker ps -q --filter "name=$nameImage" | grep -q . && docker stop $nameImage && docker rm -fv &nameImage"
                                sh "docker rmi -f $(docker images -a -q)"
                                sh "docker run -d --name=$nameImage $registryAddress/$nameImage:latest"
                            }
                        }
                    }
                }
            }
        }

    }
}
