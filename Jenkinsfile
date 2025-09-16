pipeline {
    agent any

    environment {
        EMAIL_RECIPIENTS = 'lasyasrilasya14@gmail.com'
        GITHUB_TOKEN = credentials('github-token')   // Jenkins credential with GitHub PAT
        REPO = 'LasyaSriG/nodeJS'                   // Format: user/repo
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

        /* ✅ Feature Branch → Develop */
        stage('Create PR: Feature → Develop') {
            when {
                expression { env.BRANCH_NAME != 'develop' && env.BRANCH_NAME != 'main' }
            }
            steps {
                withEnv(["GITHUB_TOKEN=${GITHUB_TOKEN}"]) {
                    sh """
                        echo "🔀 Creating PR from ${env.BRANCH_NAME} → develop"
                        gh pr create \
                          --repo ${REPO} \
                          --base develop \
                          --head ${env.BRANCH_NAME} \
                          --title "Auto PR: ${env.BRANCH_NAME} → develop" \
                          --body "This PR was auto-created by Jenkins." || true

                        echo "✅ Marking PR for auto-merge"
                        gh pr merge \
                          --repo ${REPO} \
                          --merge \
                          --auto \
                          --subject "Auto-merge: ${env.BRANCH_NAME} → develop" || true
                    """
                }
            }
        }

        /* ✅ Approval Stage for Develop → Main */
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

        /* ✅ Merge Develop → Main (after approval) */
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

                        echo "✅ Marking PR for auto-merge"
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

- If Feature branch → Code merged into develop automatically.
- If Develop branch → Merge to main after approval.

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
