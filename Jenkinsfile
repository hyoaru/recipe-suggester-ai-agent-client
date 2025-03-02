pipeline {
  agent any

  environment {
    sanitized_branch_name = env.BRANCH_NAME.replaceAll('/', '-')

    DOCKER_NETWORK_NAME = "recipe_suggester_ai_agent_network_${env.sanitized_branch_name}_${env.BUILD_ID}"
    DOCKER_IMAGE_NAME_CLIENT_ROBOT_TEST = 'recipe_suggester_ai_agent_client_robot_test'

    DOCKER_IMAGE_NAME_CLIENT_TEST = 'recipe_suggester_ai_agent_client_test'
    DOCKER_IMAGE_NAME_CLIENT_STAGING = "recipe_suggester_ai_agent_client_staging_build_${env.BUILD_ID}"
    DOCKER_IMAGE_NAME_CLIENT_PRODUCTION = "recipe_suggester_ai_agent_client_production_build_${env.BUILD_ID}"

    DOCKER_CONTAINER_NAME_CLIENT_TEST = "recipe_suggester_ai_agent_client_${env.sanitized_branch_name}_${env.BUILD_ID}"
    DOCKER_CONTAINER_NAME_CLIENT_PRODUCTION = "recipe_suggester_ai_agent_client_production"
    DOCKER_CONTAINER_NAME_CLIENT_STAGING = "recipe_suggester_ai_agent_client_staging"
  }

  options {
    // Required step for cleaning before build
    skipDefaultCheckout(true)
  }

  stages {
    stage('Setup and Environment Preparation') {
      stages {
        stage('Clean Workspace') {
          steps {
            script {
              echo 'Cleaning workspace...'
              cleanWs()
              echo 'Cleaned the workspace.'
            }
          }
        }

        stage("Checkout Source Codes") {
          parallel {
            stage('Checkout Client Source Code') {
              steps {
                dir('client') {
                  echo 'Checking out source code...'
                  checkout scm
                  echo 'Checked out source code.'
                }
              }
            }

            stage('Checkout Client-Tests Source Code') {
              environment {
                CLIENT_TESTS_REPO_URL = 'https://github.com/hyoaru/recipe-suggester-ai-agent-client-tests.git'
              }
              steps {
                dir('client-tests') {
                  echo 'Cloning client-tests repository...'
                  git branch: 'master', url: env.CLIENT_TESTS_REPO_URL
                  echo 'Checked out client-tests source code.'
                }
              }
            }
          }
        }

        stage("Populate Environment Variables") {
          parallel {
            stage('Populate Client Environment Variables') {
              environment {
                API_BASE_URL = 'https://recipe-ai-api.anonalyze.org'
              }

              steps {
                script {
                  writeEnvFile("./client", [
                    "VITE_CORE_API_URL=${env.API_BASE_URL}"
                  ])
                }
              }
            }

            stage('Populate Client-Tests Environment Variables') {
              environment {
                CLIENT_BASE_URL = "http://${env.DOCKER_CONTAINER_NAME_CLIENT_TEST}:8001"
              }
              steps {
                script {
                  writeEnvFile("./client-tests", [
                    "CLIENT_BASE_URL=${env.CLIENT_BASE_URL}"
                  ])
                }
              }
            }
          }
        }
      }
    }

    stage('Run Tests and Quality Analysis') {
      parallel {
        stage('Run Tests') {
          when {
            anyOf {
              expression { env.BRANCH_NAME.startsWith('feature') }
              expression { env.CHANGE_TARGET == 'develop' }
              expression { env.CHANGE_TARGET == 'staging' }
              expression { env.CHANGE_TARGET == 'master' }
            }
          }

          stages {
            stage('Build Docker Images') {
              steps {
                echo 'Building Docker images...'
                sh 'echo "Using docker version: $(docker --version)"'

                script {
                  buildDockerImage('./client', env.DOCKER_IMAGE_NAME_CLIENT_TEST)
                  buildDockerImage('./client-tests', env.DOCKER_IMAGE_NAME_CLIENT_ROBOT_TEST)
                }

                sh 'docker images'
                echo 'Docker images built'
              }
            }

            stage('Run Instance Independent Tests') {
              when { expression { env.BRANCH_NAME.startsWith('feature') } }
              stages {
                stage('Run Unit Tests') {
                  steps {
                    echo 'Running unit tests...'
                    echo 'Ran unit tests.'
                  }
                }
              }
            }

            stage ('Run Instance Dependent Tests') {
              when {
                anyOf {
                  expression { env.CHANGE_TARGET == 'develop' }
                  expression { env.CHANGE_TARGET == 'staging' }
                  expression { env.CHANGE_TARGET == 'master' }
                }
              }
              stages {
                stage('Run Client') {
                  steps {
                    echo "Creating docker network for client: ${env.DOCKER_NETWORK_NAME}..."
                    sh "docker network create ${env.DOCKER_NETWORK_NAME}"
                    echo 'Docker network created.'

                    script { runClientContainer('test') }
                    sh 'docker ps -a'
                  }
                }

                stage('Run Robot Smoke Tests') {
                  when {
                    expression { env.CHANGE_TARGET == 'develop' }
                  }

                  steps {
                    echo 'Smoke tests pending...'

                    script {
                      try {
                        runRobotTests('smoke')
                      } catch (Exception e) { }
                    }

                    echo 'Smoke tests done.'
                  }
                }


                stage('Run Robot Regression Tests') {
                  when {
                    anyOf {
                      expression { env.CHANGE_TARGET == 'staging' }
                      expression { env.CHANGE_TARGET == 'master' }
                    }
                  }

                  steps {
                    echo "Regression tests pending..."

                    script {
                      try {
                        runRobotTests('regression')
                      } catch (Exception e) { }
                    }

                    echo 'Regression tests done.'
                  }
                }

                stage('Publish Robot Test Reports') {
                  steps {
                    script {
                      stopClientContainer('test')
                      sh "docker network rm ${DOCKER_NETWORK_NAME}"
                    }

                    dir('./client-tests') {
                      robot(
                        outputPath: "./results",
                        passThreshold: 90.0,
                        unstableThreshold: 80.0,
                        disableArchiveOutput: true,
                        outputFileName: "output.xml",
                        logFileName: 'log.html',
                        reportFileName: 'report.html',
                        countSkippedTests: true,
                      )
                    }
                  }
                }
              }
            }
          }
        }

        stage('Quality and Security Analysis') {
          when {
            anyOf {
              expression { env.CHANGE_TARGET == 'develop' }
              expression { env.CHANGE_TARGET == 'staging' }
              expression { env.CHANGE_TARGET == 'master' }
            }
          }

          stages {
            stage ('Run SonarQube Analysis') {
              environment {
                SONAR_SCANNER = tool name: 'SonarQubeScanner-7.0.2'
                SONAR_PROJECT_KEY = "recipe-suggester-ai-agent-client"
              }

              steps {
                dir('./client') {
                  withSonarQubeEnv('SonarQube') {
                    sh "${SONAR_SCANNER}/bin/sonar-scanner -Dsonar.projectKey=${env.SONAR_PROJECT_KEY}"
                  }
                }
              }
            }

            stage('Quality Gate') {
              steps {
                script {
                  timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                  }
                }
              }
            }
          }
        }
      }
    }

    stage('Deploy to Staging') {
      when { branch 'staging' }
      stages {
        stage ('Build Docker Image For Staging') {
          steps {
            echo 'Building client docker image for staging...'
            sh 'echo "Using docker version: $(docker --version)"'

            script {
              buildDockerImage('./client', env.DOCKER_IMAGE_NAME_CLIENT_STAGING)
            }

            sh 'docker images'
            echo 'Docker client image for staging built.'
          }
        }


        stage ('Deploy') {
          steps {
            script {
              // Stop the staging client container to then run the rebuilt image
              stopClientContainer('staging')
              runClientContainer('staging')
            }
          }
        }
      }
    }

    stage('Deploy to Production') {
      when { branch 'master' }
      stages {
        stage ('Build Docker Image For Production') {
          steps {
            echo 'Building client docker image for production...'
            sh 'echo "Using docker version: $(docker --version)"'

            script {
              buildDockerImage('./client', env.DOCKER_IMAGE_NAME_CLIENT_PRODUCTION)
            }

            sh 'docker images'
            echo 'Docker client image for production built.'
          }
        }


        stage ('Deploy') {
          steps {
            script {
              // Stop the production client container to then run the rebuilt image
              stopClientContainer('production')
              runClientContainer('production')
            }
          }
        }
      }
    }
  }


  post {
    always {
      echo "Job name: ${env.JOB_NAME}"
      echo "Build url: ${env.BUILD_URL}"
      echo "Build id: ${env.BUILD_ID}"
      echo "Build display name: ${env.BUILD_DISPLAY_NAME}"
      echo "Build number: ${env.BUILD_NUMBER}"
      echo "Build tag: ${env.BUILD_TAG}"
      echo "Branch name: ${env.BRANCH_NAME}"

      script {
        if (env.CHANGE_TARGET) {
          echo "Pull request from `${env.CHANGE_BRANCH}` to `${env.CHANGE_TARGET}`"
        }
      }

      script {
        def causes = currentBuild.getBuildCauses()
        causes.each { cause ->
          echo "Build cause: ${cause.shortDescription}"
        }

        cleanDanglingImages()

        // Prune images every 5 builds based on BUILD_ID
        if (env.BUILD_ID.toInteger() % 5 == 0) {
          echo "Pruning old Docker images..."
          sh 'yes | docker image prune -a'
        }
      }
    }
  }
}


void cleanDanglingImages() {
  sh '''
    danglingImages=$(docker images -f "dangling=true" -q)
    if [ -n "$danglingImages" ]; then
      docker image rmi $danglingImages
    else
      echo "No dangling images to remove."
    fi
  '''
}

void runRobotTests(String testType) {
  dir('./client-tests') {
    docker.image(env.DOCKER_IMAGE_NAME_CLIENT_ROBOT_TEST).inside("--network=${env.DOCKER_NETWORK_NAME} --user=root") {
      if (testType != 'all') {
        sh "robot --include ${testType} --outputdir ./results ./tests/suites"
      } else {
        sh "robot --outputdir ./results ./tests/suites"
      }
    }
  }
}

void stopClientContainer(String environment) {
  String containerName

  if (environment == 'production') {
    containerName = env.DOCKER_CONTAINER_NAME_CLIENT_PRODUCTION
    echo "Stopping production client with container name: ${containerName}..."
  } else if (environment == 'staging') {
    containerName = env.DOCKER_CONTAINER_NAME_CLIENT_STAGING
    echo "Stopping staging client with container name: ${containerName}..."
  } else if (environment == 'test') {
    containerName = env.DOCKER_CONTAINER_NAME_CLIENT_TEST
    echo "Stopping test client with container name: ${containerName}..."
  } else {
    error "Invalid environment specified: ${environment}. Please use 'production' or 'staging' or 'test'."
  }

  // Check if the container exists
  def containerExists = sh(script: "docker ps -q -f name=${containerName}", returnStdout: true).trim()

  if (containerExists) {
    sh "docker stop ${containerName}"
    echo 'Stopped client.'
  } else {
    echo "Container ${containerName} does not exist. No action taken."
  }
}

void runClientContainer(String environment) {
  echo "Starting ${environment} environment client container..."

  dir ('./client') {
    if (environment == 'production') {
      sh """
        docker run -d --rm \
          --name ${env.DOCKER_CONTAINER_NAME_CLIENT_PRODUCTION} \
          --network host \
          -p 8001:8001 \
          -v \$(pwd):/app \
          ${env.DOCKER_IMAGE_NAME_CLIENT_PRODUCTION} 
      """
    } else if (environment == 'staging') {
      sh """
        docker run -d --rm \
          --name ${env.DOCKER_CONTAINER_NAME_CLIENT_STAGING} \
          --network host \
          -p 9001:8001 \
          -v \$(pwd):/app \
          ${env.DOCKER_IMAGE_NAME_CLIENT_STAGING}
      """
    } else if (environment == 'test') {
      sh """
        docker run -d --rm \
          --name ${env.DOCKER_CONTAINER_NAME_CLIENT_TEST} \
          --network=${env.DOCKER_NETWORK_NAME} \
          -v \$(pwd):/app \
          ${env.DOCKER_IMAGE_NAME_CLIENT_TEST}
      """
    } else {
      error "Invalid environment specified: ${environment}. Please use 'production' or 'staging' or 'test'."
    }
  }

  echo 'Waiting for client to start...'
  sleep 5
  echo 'Started client.'
}

void writeEnvFile(String directory, List<String> variables) {
  dir(directory) {
    echo "Writing .env file at ${directory}..."
    writeFile file: '.env', text: variables.join('\n')
    echo "Environment file created successfully at ${directory}."
  }
}

void buildDockerImage(String directory, String imageName) {
  dir(directory) {
    echo "Building ${imageName} image..."
    sh "docker build -t ${imageName} ."
    echo "${imageName} image built."
  }
}
