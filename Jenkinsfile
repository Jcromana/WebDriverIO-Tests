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

                        sh '''
                            set -e

                            git config --global user.name "Jenkins CI"
                            git config --global user.email "jenkins@local"

                            rm -rf gh-pages-branch
                            mkdir gh-pages-branch
                            cd gh-pages-branch

                            git init
                            git remote add origin "https://$GITHUB_TOKEN@github.com/Jcromana/WebDriverIO-Tests.git"

                            if git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
                                git fetch origin gh-pages
                                git checkout gh-pages
                            else
                                git checkout --orphan gh-pages
                            fi

                            git rm -rf . --ignore-unmatch || true

                            cp ../allure-report/index.html ./report.html

                            cat > index.html <<'EOF'
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebDriverIO Report</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #0d1117;
      color: #e6edf3;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .container {
      text-align: center;
      padding: 24px;
      max-width: 800px;
      width: 90%;
    }
    h1 {
      font-size: clamp(1.8rem, 4vw, 3rem);
      margin-bottom: 12px;
    }
    p {
      color: #c9d1d9;
      line-height: 1.6;
    }
    a {
      display: inline-block;
      margin-top: 18px;
      background: #238636;
      color: white;
      text-decoration: none;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: bold;
    }
    a:hover {
      background: #2ea043;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Reporte WebDriverIO</h1>
    <p>La página principal es responsive y funciona en móvil.</p>
    <p>Haz clic para abrir el reporte generado por Allure.</p>
    <a href="./report.html">Abrir reporte</a>
  </div>
</body>
</html>
EOF

                            touch .nojekyll
                            echo "Build #''' + buildNum + ''' - ''' + buildResult + '''" > version.txt

                            git add .
                            git commit -m "Deploy responsive report for build #''' + buildNum + ''' (Status: ''' + buildResult + ''')" || echo "No changes to commit"
                            git push origin gh-pages

                            cd ..
                            rm -rf gh-pages-branch

                            echo "Reporte publicado correctamente"
                            echo "URL: https://jcromana.github.io/WebDriverIO-Tests/"
                        '''
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