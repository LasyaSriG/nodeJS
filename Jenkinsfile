pipeline {
    agent any

    environment {
        EMAIL_RECIPIENTS = 'lasyasrilasya14@gmail.com'
        GITHUB_TOKEN = credentials('github-token')   // Jenkins Credential ID for GitHub PAT
        REPO = 'LasyaSriG/nodeJS'                   // Format: user/repo
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
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Auto Merge Feature → Develop') {
            when {
                expression { env.BRANCH_NAME != 'develop' && env.BRANCH_NAME != 'main' }
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

                        echo "✅ Merging PR into ${BASE_BRANCH}"
                        gh pr merge \
                          --repo ${REPO} \
                          --merge \
                          --auto
                    """
                }
            }
        }

        stage('Approval for Develop → Master') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    timeout(time: 1, unit: 'HOURS') {
                        input message: "Do you want to merge *develop → master*?", ok: "Approve Merge"
                    }
                }
            }
        }

        stage('Merge Develop → Master') {
            when {
                branch 'develop'
            }
            steps {
                withEnv(["GITHUB_TOKEN=${GITHUB_TOKEN}"]) {
                    sh """
                        echo "🔀 Creating PR from develop → main"
                        gh pr create \
                          --repo ${REPO} \
                          --base main \
                          --head develop \
                          --title "Release: develop → main" \
                          --body "This PR promotes develop to main after approval."

                        echo "✅ Merging PR into main"
                        gh pr merge \
                          --repo ${REPO} \
                          --merge \
                          --auto
                    """
                }
            }
        }
    }

    post {
        success {
            mail to: "${EMAIL_RECIPIENTS}",
                 subject: "✅ SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: """
Hello Team,

Pipeline succeeded for branch '${env.BRANCH_NAME}'.
Build: #${env.BUILD_NUMBER}
Logs: ${env.BUILD_URL}

If feature branch: code merged → develop.
If develop branch: merge to master pending approval.

Regards,
Jenkins
"""
        }
        failure {
            mail to: "${EMAIL_RECIPIENTS}",
                 subject: "❌ FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: """
Hello Team,

Pipeline failed for branch '${env.BRANCH_NAME}'.
Build: #${env.BUILD_NUMBER}
Logs: ${env.BUILD_URL}

Please check and fix.

Regards,
Jenkins
"""
        }
        always {
            cleanWs()
        }
    }
}
 
