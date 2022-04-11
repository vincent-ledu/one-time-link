def archive_file = "one-time-link.tgz"
pipeline {
  environment {
		DOCKERHUB_CREDENTIALS=credentials('dockerhub-one-time-link-accesstocker')
	}
  agent { label 'vprox' } 
  stages {
    stage('Build') { 
      steps {
        sh script: 'rm -rf *'
        checkout scm
        sh label: 'create tmp mysql for integration tests', script: 'docker-compose up -d db'
        sh label: 'Installing deps', script: 'npm ci --no-progress'
        sh label: 'Building', script: 'npm run build'
        sh label: 'Packaging', script: 'npm run pack'
        archiveArtifacts artifacts: "${archive_file}", defaultExcludes: false, followSymlinks: false, onlyIfSuccessful: true
      }
    }
    stage('Deploy') {
      steps {
        sh label: 'Stop application', script: "sudo -u www-data npm run stop:production"
        sh label: 'Untar', script: "rm -rf /tmp/one-time-link && mkdir /tmp/one-time-link/ && tar xzf ${archive_file} -C /tmp/one-time-link"
        sh label: 'Deploy', script: "sudo sh -c \"cp -r /tmp/one-time-link/* /var/www/https.one-time-link.ledu.dev/ && rm -rf /tmp/one-time-link && chown -R www-data:www-data /var/www/https.one-time-link.ledu.dev\""
        sh label: 'Start application', script: "cd /var/www/https.one-time-link.ledu.dev && sudo -u www-data npm run start:production"
      }
    }
    stage('Publish dockerhub image') {
     	steps {
				sh 'docker build -t vincentledu/one-time-link:latest .'
				sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
				sh 'docker push vincentledu/one-time-link:latest'
			}
		}
  }
  post {

    always {
		 	sh 'docker logout'
      sh label: 'stop mysql docker', script: 'docker-compose down -d db'

    }
  }
}