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

        stage('Create Pull Request (Immediate)') {
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
                          --body "This PR was auto-created by Jenkins as soon as the commit was pushed." || true

                        echo "✅ Marking PR for auto-merge"
                        gh pr merge \
                          --repo ${REPO} \
                          --merge \
                          --auto \
                          --subject "Auto-merge: ${env.BRANCH_NAME} → ${BASE_BRANCH}" || true
                    """
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            parallel {
                stage('Unit Tests') {
                    steps { sh 'npm run test:unit || npm test' }
                }
                stage('Integration Tests') {
                    steps { sh 'npm run test:integration || echo "No integration tests"' }
                }
            }
        }

        stage('Approval for Develop → Main') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    timeout(time: 1, unit: 'HOURS') {
                        input message: "Do you want to merge *develop → main*?", ok: "Approve Merge"
                    }
                }
            }
        }

        stage('Merge Develop → Main') {
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
                          --body "This PR promotes develop to main after approval." || true

                        echo "✅ Marking PR for auto-merge into main"
                        gh pr merge \
                          --repo ${REPO} \
                          --merge \
                          --auto \
                          --subject "Release auto-merge: develop → main" || true
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

- Feature branch: PR created → develop (auto-merge pending checks)
- Develop branch: PR created → main (merge pending approval)

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
 
