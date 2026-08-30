pipeline {
    agent {
        docker {
            image 'node:20'
            args '-u root:root' 
        }
    }
    
    stages {
        stage('Preparar Entorno (Librerías y Java)') {
            steps {
                sh '''
                    apt-get update
                    apt-get install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 default-jre
                '''
            }
        }

        stage('Clonar Repositorio') {
            steps {
                checkout scm
            }
        }
        
        stage('Instalar Dependencias de Node') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Ejecutar Tests WebDriverIO') {
            steps {
                sh 'npx wdio run wdio.conf.js'
            }
        }
    }
    
    post {
        always {
            // Genera el informe visual recogiendo la carpeta de resultados (asegúrate de que coincide con la ruta configurada en tu wdio.conf.ts, por lo general 'allure-results')
            allure includeProperties: false, 
                   jdk: '', 
                   report: 'allure-report', 
                   results: [[path: 'allure-results']]
        }
        success {
            echo '¡Las pruebas pasaron correctamente!'
        }
        failure {
            echo 'Hubo un error en las pruebas. Revisa los logs.'
        }
    }
}