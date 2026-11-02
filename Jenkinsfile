pipeline {
    agent {
        docker {
            image 'node:20'
            args '-u root:root' 
        }
    }
    
    stages {
        stage('Preparar Entorno (Librerías, Java y Git)') {
            steps {
                sh '''
                    apt-get update
                    apt-get install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 default-jre git
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
                // Limpiar resultados antiguos del workspace antes de correr los tests
                sh 'rm -rf allure-results allure-report'
                sh 'npx wdio run wdio.conf.js'
            }
        }
    }
    
    post {
        always {
            // Asegurar que no quede historial previo y generar el reporte limpio en archivo único
            script {
                try {
                    sh 'npx allure-commandline generate allure-results --single-file --clean -o allure-report'
                } catch (Exception e) {
                    echo "Error generando Allure: ${e.getMessage()}"
                }
            }
            
            // Publicar automáticamente el reporte limpio en la RAÍZ de GitHub Pages
            script {
                echo 'Publicando reporte Allure limpio en la raíz de GitHub Pages...'
                try {
                    withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                        def buildNum = env.BUILD_NUMBER
                        def buildResult = currentBuild.currentResult

                        sh """
                            # Configurar identidad de Git en el contenedor
                            git config --global user.name "Jenkins CI"
                            git config --global user.email "jenkins@local"
                            
                            # Preparar un directorio temporal limpio
                            rm -rf gh-pages-branch
                            mkdir gh-pages-branch
                            cd gh-pages-branch
                            
                            git init
                            git remote add origin https://${GITHUB_TOKEN}@github.com/Jcromana/WebDriverIO-Tests.git
                            
                            # Intentar descargar la rama gh-pages existente, si no existe se crea desde cero
                            git fetch origin gh-pages && git checkout gh-pages || git checkout -b gh-pages
                            
                            # Limpiar archivos anteriores de la rama por completo
                            rm -rf *
                            
                            # Copiar el archivo único index.html generado por Allure a la raíz
                            cp ../allure-report/index.html .
                            
                            # Crear un archivo de control para forzar la invalidación de caché
                            echo "Build #${buildNum} - ${buildResult}" > version.txt
                            
                            git add .
                            git commit -m "Deploy clean Allure single-file report for build #${buildNum} (Status: ${buildResult})" || echo "No changes to commit"
                            git push origin gh-pages
                            
                            cd ..
                            rm -rf gh-pages-branch
                            
                            echo "¡Reporte publicado con éxito en la raíz!"
                            echo "Podrás verlo en: https://jcromana.github.io/WebDriverIO-Tests/"
                        """
                    }
                } catch (Exception e) {
                    echo "No se pudo publicar en GitHub Pages: ${e.getMessage()}"
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