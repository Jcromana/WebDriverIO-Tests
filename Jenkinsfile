pipeline {
    // Le decimos a Jenkins que use un contenedor de Docker con Node.js preinstalado
    agent {
        docker {
            image 'node:20'
            // Esto evita problemas de permisos de escritura al instalar dependencias
            args '-u root:root' 
        }
    }
    
    stages {
        stage('Clonar Repositorio') {
            steps {
                // Jenkins descarga tu código de GitHub
                checkout scm
            }
        }
        
        stage('Instalar Dependencias') {
            steps {
                // Equivalente a lo que harías en tu terminal local
                sh 'npm install'
            }
        }
        
        stage('Ejecutar Tests WebDriverIO') {
            steps {
                // Aquí lanzamos el framework
                // Asegúrate de que el comando coincida con tu package.json
                sh 'npx wdio run wdio.conf.js'
            }
        }
    }
    
    post {
        always {
            echo 'Ejecución del pipeline terminada.'
        }
        success {
            echo '¡Las pruebas pasaron correctamente!'
        }
        failure {
            echo 'Hubo un error en las pruebas. Revisa los logs.'
        }
    }
}