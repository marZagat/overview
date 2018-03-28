# marZagat - Restaurant Rating Service

## Purpose  

This service forms a part of the marZagat food review website: a limited emulation of [Zagat.com](https://zagat.com)'s restaurant description page. The Overview service renders a summary description and aggregate ratings based on a restaurant's reviews.

## Related Projects

  - Proxy
    - [marZagat proxy server](https://github.com/marZagat/proxy-moriah)
  - Microservices
    - [Gallery](https://github.com/marZagat/Gallery)
    - [Overview](https://github.com/bamboo-connection/overview)
    - [Business Info](https://github.com/marZagat/businessinfo)
    - [Recommendations](https://github.com/marZagat/recommendations)
  - Inherited codebase
    - [Bamboo Connection: WeGot](https://github.com/bamboo-connection)

## Table of Contents

  1. [Usage](#Usage)
  1. [Requirements](#requirements)
  1. [Development](#development)

## Requirements

- Node:9.5.0
- MongoDB:3.6
- Redis:3.2
- Yarn package manager

## Usage

1. Make sure your environment is set up with the correct [requirements](#requirements) for node, Mongo, Redis, and Yarn, above
1. Install dependencies: `yarn install`
1. Environment variables
    1. To seed the database and run the server, you can customize certain values with environment variables in a `.env` file, in the root directory of the project. Below are the environment variables used in the project, with their defaults if no customization is provided:
    ```
    # mongo connection info
    MONGO_ADDRESS=localhost
    MONGO_DB_NAME=marzagat_overview
    MONGO_COLLECTION=restaurants

    # redis connection info
    REDIS_ADDRESS=localhost

    # seeding preferences
    SEED_NUM=10000000
    SEED_BATCH_SIZE=15000

    # [optional] provide your own newrelic API key to track server metrics
    NEWRELIC_LICENSE_KEY=
    ```
1. Seed the database:  
    1. Run mongo daemon with `mongod` if not already running
    1. From project directory, run `yarn run seed`
1. Compile client-side code: `yarn run build`
1. Start up the server:
    1. Run mongo daemon with `mongod` if not already running
    1. Run redis server with `redis-server` if not already running
    1. Spin up the server with `yarn start`
    1. View service in browser at `localhost:3002`

## Development

This project is no longer using webpack-dev-middleware!!! You need to run webpack manually. See below.

### Installing Dependencies

From within the root directory:
```
Install dependencies: npm install OR yarn install
Start webpack: npm run dev OR yarn dev
Start server: npm start OR yarn start
Spin up mongo on your computer and then: npm run seed OR yarn seed
```

### Credits
The front end of the marZagat app was built by [Bamboo Connection](https://github.com/bamboo-connection) as the WeGot client, and inherited by the [marZagat](https://github.com/marZagat) backend engineering team to load test and optimize performance at webscale. The front end for the Overview microservice was created by [@MadLicorice](https://github.com/MadLicorice).
