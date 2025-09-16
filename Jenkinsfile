pipeline {
    agent any

    environment {
        EMAIL_RECIPIENTS = 'lasyasrilasya14@gmail.com'
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
                    script {
                        mail to: "${EMAIL_RECIPIENTS}",
                             subject: "BUILD FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                             body: """
Hello Team,

The pipeline failed during *dependency installation*.
Branch: ${env.BRANCH_NAME}
Build: #${env.BUILD_NUMBER}
Logs: ${env.BUILD_URL}

Regards,
Jenkins
"""
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
            post {
                failure {
                    script {
                        mail to: "${EMAIL_RECIPIENTS}",
                             subject: "BUILD FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                             body: """
Hello Team,

The pipeline failed during *tests*.
Branch: ${env.BRANCH_NAME}
Build: #${env.BUILD_NUMBER}
Logs: ${env.BUILD_URL}

Regards,
Jenkins
"""
                    }
                }
                success {
                    echo "✅ Tests passed successfully."
                }
            }
        }

        stage('Ready for Merge') {
            when {
                expression { currentBuild.resultIsBetterOrEqualTo('SUCCESS') }
            }
            steps {
                echo "Build & tests passed for branch '${env.BRANCH_NAME}'."
                echo "Proceed with PR: feature → develop → master (with approvals)."
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            script {
                mail to: "${EMAIL_RECIPIENTS}",
                     subject: "BUILD SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                     body: """
Hello Team,

The pipeline for branch '${env.BRANCH_NAME}' finished successfully.
Build: #${env.BUILD_NUMBER}
Logs: ${env.BUILD_URL}

You can now proceed with the Pull Request.

Regards,
Jenkins
"""
            }
        }
        failure {
            script {
                mail to: "${EMAIL_RECIPIENTS}",
                     subject: "BUILD FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                     body: """
Hello Team,

The pipeline for branch '${env.BRANCH_NAME}' failed.
Build: #${env.BUILD_NUMBER}
Logs: ${env.BUILD_URL}

Please check the issue.

Regards,
Jenkins
"""
            }
        }
    }
}
