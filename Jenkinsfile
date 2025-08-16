pipeline {
    agent any

    environment {
        HUSKY = '0'
    }

    stages {
        stage('Setup') {
            steps {
                script {
                    sh 'pnpm install'
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    sh 'pnpm run test --no-watch'
                }
            }

            post {
                always {
                    publishHTML(target: [
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: false,
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Vitest Coverage Report'
                    ])
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    sh 'pnpm run build'
                }
            }
        }

        stage('Archive') {
            steps {
                script {
                    archiveArtifacts artifacts: 'build/**/*',
                        excludes: 'build/**/*-unpacked/**, build/**/mac-*/**',
                        fingerprint: true,
                        allowEmptyArchive: false
                    archiveArtifacts artifacts: 'coverage/**',
                        fingerprint: true,
                        allowEmptyArchive: false
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }

        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed!'
        }
    }
}
