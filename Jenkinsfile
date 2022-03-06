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
  stage('Deploy') {
    sh label: 'Untar', script: "mkdir /tmp/one-time-link/ && tar xvzf ${archive_file} -C /tmp/one-time-link"
    sh label: 'Deploy', script: "sudo sh -c \"rm -rf /var/www/https.one-time-link.ledu.net/ && mv /tmp/one-time-link/* /var/www/https.one-time-link.ledu.net/ && chown -R www-data:www-data /var/www/https.one-time-link.ledu.net\""
 
  }
}