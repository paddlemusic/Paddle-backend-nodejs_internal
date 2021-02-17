const swaggerJsdoc = require('swagger-jsdoc')
const options = {
  swaggerDefinition: {
    info: {
      title: 'Paddle',
      version: '1.0.0',
      description: 'All v1 routes documentation',
      license: {
        name: '',
        url: ''
      },
      contact: {
        name: '',
        url: '',
        email: ''
      },
      servers: [
        {
          url: 'http://localhost:8080/paddle/api/v1',
          description: 'Local server'
        }
      ]
    },
    host: `${process.env.HOST}:${process.env.PORT}`,
    basePath: '/paddle/api/v1',
    tags: [{
      name: 'user',
      description: 'Everything about user',
      externalDocs: {
        description: 'Find out more',
        url: 'http://swagger.io'
      }
    },
    {
      name: 'profile',
      description: 'Everything about profile',
      externalDocs: {
        description: 'Find out more',
        url: 'http://swagger.io'
      }
    },
    {
      name: 'chart',
      description: 'Everything about charts',
      externalDocs: {
        description: 'Find out more',
        url: 'http://swagger.io'
      }
    },
    {
      name: 'home',
      description: 'Everything about Home feed',
      externalDocs: {
        description: 'Find out more',
        url: 'http://swagger.io'
      }
    },
    {
      name: 'admin',
      description: 'Everything about user management',
      externalDocs: {
        description: 'Find out more',
        url: 'http://swagger.io'
      }
    }],
    schemes: [
      'http',
      'https'
    ],
    consumes: [
      'application/json'
    ],
    produces: [
      'application/json'
    ]
  },

  // List of files to be processes. You can also set globs './routes/*.js'
  // apis: ['./app/routes*.js'],
  apis: ['./app/api/user/routes/*.js', './app/api/admin/routes/*.js']
}
/* const options2 = {
  swaggerDefinition: {
    info: {
      title: 'Paddle',
      version: '1.0.0',
      description: 'All v2 routes documentation',
      license: {
        name: '',
        url: ''
      },
      contact: {
        name: '',
        url: '',
        email: ''
      },
      servers: [
        {
          url: 'http://localhost:8080/paddle/api/v2',
          description: 'Local server'
        }
      ]
    },
    host: `${process.env.HOST}:${process.env.PORT}`,
    basePath: '/paddle/api/v2',
    tags: [{
      name: 'User',
      description: 'Everything about user',
      externalDocs: {
        description: 'Find out more',
        url: 'http://swagger.io'
      }
    }],
    schemes: [
      'http',
      'https'
    ],
    consumes: [
      'application/json'
    ],
    produces: [
      'application/json'
    ]
  },

  // List of files to be processes. You can also set globs './routes/*.js'
  // apis: ['./app/routes*.js'],
  apis: ['./app/api/admin/routes/*.js']

} */
const swaggerSpecification = swaggerJsdoc(options)
// const swaggerSpecification2 = swaggerJsdoc(options2)
module.exports = {
  swaggerSpecification
  // swaggerSpecification2
}
