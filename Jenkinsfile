def archive_file = "one-time-link.tgz"

node('nodejs17') {
  stage('clean workspace') {
    sh script: 'rm -rf *'
  }
  stage('pulling code') {
    checkout scm
  }
  
  stage('Building') {
    sh label: 'Installing deps', script: 'npm ci --no-progress'
  }

  stage('Tarring tarball') {
    sh label: 'Making tarball', script: "cd .. && tar --exclude='.env.sample' -cvzf ${archive_file} ${JOB_BASE_NAME} && mv ${archive_file} ${JOB_BASE_NAME}"
  }
  stage('Archiving') {
    archiveArtifacts artifacts: "${archive_file}", defaultExcludes: false, followSymlinks: false, onlyIfSuccessful: true
  }
}