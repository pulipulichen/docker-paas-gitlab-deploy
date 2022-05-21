npm link js-yaml fast-glob

cypress run --headless --project test --spec "test/cypress/integration/index.spec.js"
cypress run --headless --project test --spec "test/cypress/integration/**/[!app.spec.js][!index.spec.js]*"
cypress run --headless --project test --spec "test/cypress/integration/app.spec.js"