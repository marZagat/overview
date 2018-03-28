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

## Usage

> This project is running on port 3002.
> http://127.0.0.1:3002

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
