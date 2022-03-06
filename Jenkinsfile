def archive_file = "one-time-link.tgz"
pipeline {
  agent any 
  stages {
    stage('Build') { 
      steps {
        sh script: 'rm -rf *'
        checkout scm
        sh label: 'Installing deps', script: 'npm ci --no-progress'
        sh label: 'Building', script: 'npm run build'
        sh label: 'Delete non production folder', script: 'rm -rf tests src'
        sh label: 'Making tarball', script: "cd .. && tar --exclude='.env.sample' --exclude='tests' --exclude='src' --exclude='.git' -cvzf ${archive_file} ${JOB_BASE_NAME} && mv ${archive_file} ${JOB_BASE_NAME}"
        archiveArtifacts artifacts: "${archive_file}", defaultExcludes: false, followSymlinks: false, onlyIfSuccessful: true
      }
    }
    stage('Deploy') {
      agent { label 'vprox'}
      steps {
        copyArtifacts(projectName: 'one-time-link');
        sh label: 'Untar', script: "rm -rf /tmp/one-time-link && mkdir /tmp/one-time-link/ && tar xvzf ${archive_file} -C /tmp/one-time-link"
        sh label: 'Deploy', script: "sudo sh -c \"rm -rf /var/www/https.one-time-link.ledu.net/ && mv /tmp/one-time-link/* /var/www/https.one-time-link.ledu.net/ && chown -R www-data:www-data /var/www/https.one-time-link.ledu.net\""
      }
      steps { 
        sh label: 'Start application', script: "cd /var/www/https.one-time-link.ledu.net && npm run start:production"
      }
    }
  }
}