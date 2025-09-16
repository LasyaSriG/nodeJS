pipeline {
    agent any

    environment {
        REPO         = "https://github.com/LasyaSriG/nodeJS"      // Replace with your repo
        BASE_BRANCH  = "develop"
        GITHUB_TOKEN = credentials('github-token') // Jenkins secret
    }

    stages {

        stage('Create PR: Feature → Develop') {
            when {
                expression { 
                    return env.BRANCH_NAME != 'develop' && env.BRANCH_NAME != 'main'
                }
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
                    """
                }
            }
        }

        stage('Approval for Develop → Main') {
            when {
                branch 'develop'
            }
            steps {
                input message: "Approve merge from develop → main?", ok: "Merge"
            }
        }

        stage('Merge Develop → Main') {
            when {
                branch 'develop'
            }
            steps {
                withEnv(["GITHUB_TOKEN=${GITHUB_TOKEN}"]) {
                    sh """
                        echo "✅ Merging develop → main"
                        gh pr create \
                          --repo ${REPO} \
                          --base main \
                          --head develop \
                          --title "Auto PR: develop → main" \
                          --body "This PR was auto-created by Jenkins after approval." || true

                        gh pr merge \
                          --repo ${REPO} \
                          --merge \
                          --auto \
                          --subject "Auto-merge: develop → main" || true
                    """
                }
            }
        }

        stage('No Action on Main') {
            when {
                branch 'main'
            }
            steps {
                echo "ℹ️ On main branch → no PR created (only receives merges)."
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
