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
            
            // 2. Publica automáticamente el reporte en GitHub Pages
            script {
                echo 'Publicando reporte Allure en GitHub Pages...'
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
                            
                            # Crear carpeta histórica para esta build específica
                            mkdir -p builds/build-${buildNum}
                            cp -r ../allure-report/* builds/build-${buildNum}/
                            
                            # Crear el index.html de redirección de forma segura línea por línea
                            echo '<!DOCTYPE html>' > index.html
                            echo '<html>' >> index.html
                            echo '<head>' >> index.html
                            echo '    <meta charset="utf-8">' >> index.html
                            echo '    <meta http-equiv="refresh" content="0; url=builds/build-${buildNum}/index.html">' >> index.html
                            echo '    <title>Redirecting to Allure Report</title>' >> index.html
                            echo '</head>' >> index.html
                            echo '<body>' >> index.html
                            echo '    <p>Redirigiendo al último reporte de Allure... <a href="builds/build-${buildNum}/index.html">Pulsa aquí si no redirige automáticamente</a>.</p>' >> index.html
                            echo '</body>' >> index.html
                            echo '</html>' >> index.html
                            
                            git add .
                            git commit -m "Deploy Allure report for build #${buildNum} (Status: ${buildResult})" || echo "No changes to commit"
                            git push origin gh-pages
                            
                            cd ..
                            rm -rf gh-pages-branch
                            
                            echo "¡Reporte publicado con éxito en GitHub Pages!"
                            echo "Podrás verlo en: https://jcromana.github.io/WebDriverIO-Tests/builds/build-${buildNum}/"
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