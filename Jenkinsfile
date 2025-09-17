pipeline {
    agent any

    environment {
        REPO        = "https://github.com/LasyaSriG/nodeJS"   // Your repo
        BASE_BRANCH = "develop"
        NOTIFY_EMAIL = "lasyasrilasya14@gmail.com"            // Change to your email or a group DL
    }

    stages {

        stage('Checkout & Install') {
            steps {
                checkout scm
                sh '''
                    echo "📦 Installing dependencies"
                    npm install
                '''
            }
        }

        stage('Run Node.js Tests') {
            steps {
                script {
                    try {
                        sh 'npm test'
                    } catch (err) {
                        mail to: "${env.NOTIFY_EMAIL}",
                             subject: "❌ Jenkins: Node.js Test Failure in ${env.BRANCH_NAME}",
                             body: """\
Hi,

Your code in branch ${env.BRANCH_NAME} failed Node.js test cases.
Please check the Jenkins console output for details.

Thanks,  
Jenkins
"""
                        error("❌ Node.js tests failed. Aborting pipeline.")
                    }
                }
            }
        }

        stage('PR + Merge: Feature → Develop') {
            when {
                expression {
                    return env.BRANCH_NAME != 'develop' && env.BRANCH_NAME != 'main'
                }
            }
            steps {
                withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                    sh '''
                        # Detect correct source branch (CHANGE_BRANCH for PR jobs, BRANCH_NAME otherwise)
                        SRC_BRANCH="${CHANGE_BRANCH:-$BRANCH_NAME}"

                        echo "🔀 Checking out branch $SRC_BRANCH"
                        git fetch origin $SRC_BRANCH:$SRC_BRANCH
                        git checkout $SRC_BRANCH

                        echo "🔀 Creating PR from $SRC_BRANCH → develop"
                        PR_URL=$(gh pr create \
                          --repo ${REPO} \
                          --base develop \
                          --head $SRC_BRANCH \
                          --title "Auto PR: $SRC_BRANCH → develop" \
                          --body "This PR was auto-created by Jenkins." 2>/dev/null || true)

                        if [ -z "$PR_URL" ]; then
                          PR_URL=$(gh pr view $SRC_BRANCH --repo ${REPO} --json url -q .url || true)
                        fi

                        echo "✅ Merging $SRC_BRANCH → develop"
                        gh pr merge "$PR_URL" \
                          --repo ${REPO} \
                          --merge \
                          --auto \
                          --subject "Auto-merge: $SRC_BRANCH → develop" || true
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
                        SRC_BRANCH="develop"

                        echo "🔀 Checking out $SRC_BRANCH"
                        git fetch origin $SRC_BRANCH:$SRC_BRANCH
                        git checkout $SRC_BRANCH

                        echo "🔀 Creating PR from $SRC_BRANCH → main"
                        PR_URL=$(gh pr create \
                          --repo ${REPO} \
                          --base main \
                          --head $SRC_BRANCH \
                          --title "Auto PR: $SRC_BRANCH → main" \
                          --body "This PR was auto-created by Jenkins after approval." 2>/dev/null || true)

                        if [ -z "$PR_URL" ]; then
                          PR_URL=$(gh pr view $SRC_BRANCH --repo ${REPO} --json url -q .url || true)
                        fi

                        echo "✅ Merging $SRC_BRANCH → main"
                        gh pr merge "$PR_URL" \
                          --repo ${REPO} \
                          --merge \
                          --auto \
                          --subject "Auto-merge: $SRC_BRANCH → main" || true
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
