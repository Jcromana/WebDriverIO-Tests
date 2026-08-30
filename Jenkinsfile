pipeline {
    agent {
        docker {
            image 'node:20'
            // Mantenemos root para tener permisos de instalación de librerías
            args '-u root:root' 
        }
    }
    
    stages {
        stage('Preparar Entorno (Librerías y Java)') {
            steps {
                // Instalamos las dependencias que necesitan Chrome y Allure
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
            echo 'Ejecución del pipeline terminada.'
            // Aquí puedes añadir en el futuro el paso para publicar el reporte de Allure en Jenkins
        }
        success {
            echo '¡Las pruebas pasaron correctamente!'
        }
        failure {
            echo 'Hubo un error en las pruebas. Revisa los logs.'
        }
    }
}