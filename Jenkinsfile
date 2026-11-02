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
                    apt-get install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 default-jre zip
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
            // 1. Genera el informe visual de Allure
            allure includeProperties: false, 
                   jdk: '', 
                   report: 'allure-report', 
                   results: [[path: 'allure-results']]
            
            // 2. Sube el reporte a GitHub siempre (tanto si pasa como si falla)
            script {
                echo 'Subiendo reporte Allure a GitHub (Bloque Always)...'
                try {
                    withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                        // Definimos el JSON fuera del sh usando Groovy para evitar problemas de escape
                        def jsonBody = """{
                            "tag_name": "build-${env.BUILD_NUMBER}",
                            "name": "Reporte Allure - Build #${env.BUILD_NUMBER} (Estado: ${currentBuild.currentResult})",
                            "body": "Reporte de ejecución generado automáticamente desde Jenkins local. Resultado de la build: ${currentBuild.currentResult}.",
                            "draft": false,
                            "prerelease": false
                        }"""
                        
                        env.JSON_PAYLOAD = jsonBody

                        sh '''
                            # Comprimir la carpeta del reporte generado
                            zip -r allure-report.zip allure-report/
                            
                            TAG_NAME="build-${BUILD_NUMBER}"
                            REPO="Jcromana/WebDriverIO-Tests"
                            
                            echo "Creando Release en GitHub para la versión ${TAG_NAME}..."
                            
                            CREATE_RESPONSE=$(curl -s -X POST \
                                -H "Authorization: Bearer ${GITHUB_TOKEN}" \
                                -H "Accept: application/vnd.github+json" \
                                https://api.github.com/repos/${REPO}/releases \
                                -d "$JSON_PAYLOAD")
                            
                            RELEASE_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | head -n 1 | cut -d':' -f2)
                            
                            if [ -z "$RELEASE_ID" ]; then
                                echo "Error al crear la Release en GitHub."
                                exit 1
                            fi
                            
                            echo "Subiendo allure-report.zip a la Release ID: ${RELEASE_ID}..."
                            
                            curl -s -X POST \
                                -H "Authorization: Bearer ${GITHUB_TOKEN}" \
                                -H "Content-Type: application/zip" \
                                -H "Accept: application/vnd.github+json" \
                                --data-binary "@allure-report.zip" \
                                https://uploads.github.com/repos/${REPO}/releases/${RELEASE_ID}/assets?name=allure-report-${BUILD_NUMBER}.zip
                                
                            echo "¡Reporte subido con éxito a GitHub!"
                        '''
                    }
                } catch (Exception e) {
                    echo "No se pudo subir el reporte a GitHub: ${e.getMessage()}"
                }
            }
        }
        success {
            echo '¡Las pruebas pasaron correctamente!'
        }
        failure {
            echo 'Hubo un error en las pruebas. Revisa los logs.'
        }
    }
}