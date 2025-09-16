pipeline {
    agent any

    environment {
        EMAIL_RECIPIENTS = 'lasyasrilasya14@gmail.com'
        GITHUB_TOKEN = credentials('github-token')   // Jenkins Credential ID for GitHub PAT
        REPO = 'https://github.com/LasyaSriG/nodeJS'                  // Replace with your GitHub repo (user/org + repo)
        BASE_BRANCH = 'develop'
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

        stage('Create Pull Request') {
            when {
                expression { currentBuild.resultIsBetterOrEqualTo('SUCCESS') && env.BRANCH_NAME != 'develop' && env.BRANCH_NAME != 'main' }
            }
            steps {
                withEnv(["GITHUB_TOKEN=${GITHUB_TOKEN}"]) {
                    sh """
                        echo "🔀 Creating PR from ${env.BRANCH_NAME} → ${BASE_BRANCH}"
                        gh pr create \
                          --repo ${REPO} \
                          --base ${BASE_BRANCH} \
                          --head ${env.BRANCH_NAME} \
                          --title "Auto PR: ${env.BRANCH_NAME} → ${BASE_BRANCH}" \
                          --body "This PR was automatically created by Jenkins after successful build & tests."
                    """
                }
            }
        }

        stage('Ready for Merge') {
            when {
                expression { currentBuild.resultIsBetterOrEqualTo('SUCCESS') }
            }
            steps {
                echo "Build & tests passed for branch '${env.BRANCH_NAME}'."
                echo "PR created from feature → develop. Next step: merge develop → master with approvals."
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

A Pull Request has been automatically created.

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
