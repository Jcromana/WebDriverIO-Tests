pipeline {
    agent {
        docker {
            image 'node:20'
            args '-u root:root'
        }
    }

    stages {
        stage('Preparar entorno') {
            steps {
                sh '''
                    apt-get update
                    apt-get install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 default-jre git
                '''
            }
        }

        stage('Clonar repo') {
            steps {
                checkout scm
            }
        }

        stage('Instalar dependencias') {
            steps {
                sh 'npm install'
            }
        }

        stage('Ejecutar tests') {
            steps {
                sh 'rm -rf allure-results allure-report'
                sh 'npx wdio run wdio.conf.js'
            }
        }

        stage('Generar reporte Allure') {
            steps {
                sh '''
                    npx allure-commandline generate allure-results --single-file --clean -o allure-report
                '''
            }
        }

        stage('Publicar en GitHub Pages') {
            steps {
                withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
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

                        # Copiamos el reporte real a report.html
                        cp ../allure-report/index.html ./report.html

                        # Página principal simple y responsive
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
      margin-bottom: 12px;
      font-size: clamp(1.8rem, 4vw, 3rem);
    }
    p {
      font-size: 1rem;
      line-height: 1.6;
      color: #c9d1d9;
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
    <p>La página principal funciona correctamente y es responsive.</p>
    <p>Haz clic para abrir el reporte generado por Allure.</p>
    <a href="./report.html">Abrir reporte</a>
  </div>
</body>
</html>
EOF

                        touch .nojekyll

                        echo "Build refreshed at $(date)" > version.txt

                        git add .
                        git commit -m "Deploy static landing page and Allure report" || echo "No changes to commit"
                        git push origin gh-pages

                        cd ..
                        rm -rf gh-pages-branch

                        echo "Publicado en GitHub Pages"
                        echo "URL: https://jcromana.github.io/WebDriverIO-Tests/"
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completado correctamente'
        }
        failure {
            echo 'Pipeline falló'
        }
    }
}