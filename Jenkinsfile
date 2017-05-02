// as a hint there is a distinction in the jenkinsfile documentation about which syntax is which so make sure to click in the fine print
// Toggle Scripted Pipeline (Advanced)
properties([
    parameters([
        booleanParam (
            defaultValue: false,
            description: 'In the rare case you need to deploy to dev without building. By default a build will automatically deploy to dev.',
            name : 'DEPLOY_TO_DEV'),
        booleanParam (
            defaultValue: false,
            description: 'For deploying to prod.',
            name : 'DEPLOY_TO_PROD'),
        booleanParam (
            defaultValue: false,
            description: 'For skipping the build if the latest commit is just a tag from nitro-builds',
            name : 'skipTheBuild'),
        string (
            defaultValue: 'put_version_here',
            description: 'For deploying to prod set to true. Adding a version is required',
            name : 'VERSION')
    ]),
    pipelineTriggers([
        [$class: "SCMTrigger", scmpoll_spec: "H/2 * * * *"],
    ]),
  ])

node('aws-jenkins') {
    deleteDir()
    stage('Checkout') {
        git poll: true, branch: 'master', credentialsId: '2f292ef2-7674-480a-85ea-52307207c2ce', url: 'git@github.com:benoahriz/serverless-s3spa.git'
        result = sh (script: "git log -1 | grep '.*Author: nitro-builds.*'", returnStatus: true)
        skipBuild = false
        if ( result == 0 || params.skipTheBuild == true ) {
            skipBuild = true
            echo ("'Author: nitro-builds' spotted in last git commit. Aborting.")
            println env.skipTheBuild
            println params.skipTheBuild
            println skipTheBuild
            println skipBuild
        } else {
            echo "No skipTheBuild flag found."
        }
    }
    nodejs(nodeJSInstallationName: 'node-6.10.2') {
        stage('Build') {
             if ( params.DEPLOY_TO_PROD == false && params.DEPLOY_TO_DEV == false && skipBuild == false ) {
                sshagent(['2f292ef2-7674-480a-85ea-52307207c2ce']) {
                    sh 'git config user.name \"nitro-builds\"'
                    sh 'git config push.default matching'
                    sh 'npm version patch'
                    println env.skipTheBuild
                    println params.skipTheBuild
                    println result
                    println skipBuild
                    sh 'env'
                    currentBuild.displayName  = sh(script: 'git describe --abbrev=0 --tags | sed \'s/v//\'', returnStdout: true)
                    println currentBuild.displayName
                }
             } else {
                echo "Skipped BUILD."

             }
        }
    }
    stage('DeployToDev') {
        if ( params.DEPLOY_TO_PROD == false && params.DEPLOY_TO_DEV == true ) {
        buildVersionName = sh(script: 'git describe --abbrev=0 --tags | sed \'s/v//\'', returnStdout: true)
        dir('mesos-deploy-configs') {
            echo "run the dev deploy"
            currentBuild.displayName  = "${buildVersionName}deploy-dev"
            println buildVersionName
            println currentBuild.displayName
        }
        } else {
            echo "Skipped DeployToDev."
        }
    }
    stage('DeployToProd') {
        if ( params.DEPLOY_TO_PROD ==~ /(?i)(Y|YES|T|TRUE|ON|RUN)/ && params.DEPLOY_TO_DEV == false || env.skipTheBuild == false ) {
        buildVersionName = sh(script: 'git describe --abbrev=0 --tags | sed \'s/v//\'', returnStdout: true)
            dir('mesos-deploy-configs') {
                echo "Run the prod deploy"
                currentBuild.displayName  = "${buildVersionName}deploy-prod"
                println currentBuild.displayName
            }
        } else {
            echo "Skipped deploy to DeployToProd."
        }
    }
}