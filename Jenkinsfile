pipeline {
    agent any

    environment {
        REPO        = "https://github.com/LasyaSriG/nodeJS" // Your repo
        BASE_BRANCH = "develop"
    }

    stages {

        stage('PR + Merge: Feature → Develop') {
            when {
                expression {
                    return env.BRANCH_NAME != 'develop' && env.BRANCH_NAME != 'main'
                }
            }
            steps {
                withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                    sh '''
                        echo "🔀 Checking out branch ${BRANCH_NAME}"
                        git fetch origin ${BRANCH_NAME}:${BRANCH_NAME}
                        git checkout ${BRANCH_NAME}

                        echo "🔀 Creating PR from ${BRANCH_NAME} → develop"
                        PR_URL=$(gh pr create \
                          --repo ${REPO} \
                          --base develop \
                          --head ${BRANCH_NAME} \
                          --title "Auto PR: ${BRANCH_NAME} → develop" \
                          --body "This PR was auto-created by Jenkins." 2>/dev/null || true)

                        # Fallback if PR already exists
                        if [ -z "$PR_URL" ]; then
                          PR_URL=$(gh pr view ${BRANCH_NAME} --repo ${REPO} --json url -q .url || true)
                        fi

                        echo "✅ Merging ${BRANCH_NAME} → develop"
                        gh pr merge "$PR_URL" \
                          --repo ${REPO} \
                          --merge \
                          --auto \
                          --subject "Auto-merge: ${BRANCH_NAME} → develop" || true
                    '''
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

        stage('PR + Merge: Develop → Main') {
            when {
                branch 'develop'
            }
            steps {
                withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                    sh '''
                        echo "🔀 Checking out develop branch"
                        git fetch origin develop:develop
                        git checkout develop

                        echo "🔀 Creating PR from develop → main"
                        PR_URL=$(gh pr create \
                          --repo ${REPO} \
                          --base main \
                          --head develop \
                          --title "Auto PR: develop → main" \
                          --body "This PR was auto-created by Jenkins after approval." 2>/dev/null || true)

                        # Fallback if PR already exists
                        if [ -z "$PR_URL" ]; then
                          PR_URL=$(gh pr view develop --repo ${REPO} --json url -q .url || true)
                        fi

                        echo "✅ Merging develop → main"
                        gh pr merge "$PR_URL" \
                          --repo ${REPO} \
                          --merge \
                          --auto \
                          --subject "Auto-merge: develop → main" || true
                    '''
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
