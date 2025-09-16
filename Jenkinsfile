pipeline {
    agent any

    environment {
        EMAIL_RECIPIENTS = 'dev-team@example.com'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
            post {
                failure {
                    mail to: "${EMAIL_RECIPIENTS}",
                         subject: "BUILD FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                         body: """Hello Team,

The pipeline failed during the *dependency installation* stage.
Branch: ${env.BRANCH_NAME}
Build: #${env.BUILD_NUMBER}
Logs: ${env.BUILD_URL}

Please check and fix the issue.

Regards,
Jenkins
"""
                    currentBuild.result = 'FAILURE'
                }
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
            post {
                failure {
                    mail to: "${EMAIL_RECIPIENTS}",
                         subject: "BUILD FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                         body: """Hello Team,

The pipeline failed during the *test execution* stage.
Branch: ${env.BRANCH_NAME}
Build: #${env.BUILD_NUMBER}
Logs: ${env.BUILD_URL}

Please review the test results.

Regards,
Jenkins
"""
                    currentBuild.result = 'FAILURE'
                }
                success {
                    echo "Tests passed successfully."
                }
            }
        }

        stage('Ready for Merge') {
            when {
                expression { currentBuild.result != 'FAILURE' }
            }
            steps {
                script {
                    echo "Build & tests passed for branch '${env.BRANCH_NAME}'."
                    echo "Proceed with Pull Request: feature → develop → master (with approvals)."
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            mail to: "${EMAIL_RECIPIENTS}",
                 subject: "BUILD SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: """Hello Team,

The pipeline for branch '${env.BRANCH_NAME}' finished successfully.
Build: #${env.BUILD_NUMBER}
Logs: ${env.BUILD_URL}

You can now proceed with the Pull Request to 'develop'.
Once approved and merged, changes can be promoted to 'master'.

Regards,
Jenkins
"""
        }
        failure {
            // Extra safeguard email in case failure wasn’t already sent
            mail to: "${EMAIL_RECIPIENTS}",
                 subject: "BUILD FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: """Hello Team,

The pipeline for branch '${env.BRANCH_NAME}' failed.
Build: #${env.BUILD_NUMBER}
Logs: ${env.BUILD_URL}

Please investigate the issue.

Regards,
Jenkins
"""
        }
    }
}
