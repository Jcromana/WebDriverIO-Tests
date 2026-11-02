pipeline {
    agent {
        docker {
            image 'node:20'
            args '-u root:root'
        }
    }

    environment {
        GIT_REPO_URL = 'https://github.com/Jcromana/WebDriverIO-Tests.git'
        GH_PAGES_URL = 'https://jcromana.github.io/WebDriverIO-Tests/'
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
                sh 'rm -rf allure-results allure-report'
                sh 'npx wdio run wdio.conf.js'
            }
        }

        stage('Generar Reporte Allure') {
            steps {
                sh '''
                    npx allure-commandline generate allure-results --single-file --clean -o allure-report
                '''
            }
        }
    }

    post {
        always {
            script {
                try {
                    withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                        def buildNum = env.BUILD_NUMBER
                        def buildResult = currentBuild.currentResult

                        sh """
                            set -e

                            git config --global user.name "Jenkins CI"
                            git config --global user.email "jenkins@local"

                            rm -rf gh-pages-branch
                            mkdir gh-pages-branch
                            cd gh-pages-branch

                            git init
                            git remote add origin https://${GITHUB_TOKEN}@github.com/Jcromana/WebDriverIO-Tests.git

                            if git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
                                git fetch origin gh-pages
                                git checkout gh-pages
                            else
                                git checkout --orphan gh-pages
                            fi

                            git rm -rf . --ignore-unmatch || true

                            # Copiamos el reporte real a una ruta fija
                            cp ../allure-report/index.html ./report.html

                            # Añadimos un wrapper responsive para la raíz de GitHub Pages
                            cat > index.html <<'EOF'
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <title>WebDriverIO Report</title>
  <style>
    html, body {
      margin: 0;
      width: 100%;
      height: 100%;
      background: #0d1117;
      color: #fff;
      font-family: Arial, sans-serif;
      overflow: hidden;
    }
    body {
      display: flex;
      flex-direction: column;
    }
    iframe {
      width: 100%;
      height: 100vh;
      border: 0;
      background: #fff;
    }
  </style>
</head>
<body>
  <iframe src="./report.html" title="Allure Report"></iframe>
</body>
</html>
EOF

                            # Evita que GitHub Pages procese cosas raras
                            touch .nojekyll

                            # Caché busting para que el móvil no use una copia vieja
                            echo "Build #${buildNum} - ${buildResult}" > version.txt

                            git add .
                            git commit -m "Deploy responsive report for build #${buildNum} (Status: ${buildResult})" || echo "No changes to commit"
                            git push origin gh-pages

                            cd ..
                            rm -rf gh-pages-branch

                            echo "Reporte publicado con éxito en GitHub Pages"
                            echo "URL: ${GH_PAGES_URL}"
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