# DsALgo TestCodingSkills Backend

This repository contains the codebase for the dsalgo-testcodingskills-backend of the dsalgo-testcodingskills organisation.

### Prerequisites

- Node.js with version 18.x (with npm) installed on your machine.
- Docker cli with version 24.x
- Docker Compose cli with version 1.29.2

### Installation

1. Clone the Socket Server repository:

    ```bash
    $ git clone https://github.com/dsalgo-testcodingskills/dsalgo-testcodingskills-backend.git
    $ cd dsalgo-testcodingskills
    ```

2. Install dependencies:

    ```bash
    $ npm install
    ```

3. Configuration:

    - Create a `.env` file in the root directory by copying the contents from `sample.env`.
    - Customize the variables in the `.env` file based on your specific requirements.

### Start Mongodb locally

```bash
$ docker-compose up -d mongodb 
```

### Build and Run Backend locally

```bash
# build command
$ npm run build
```

```bash
# run command
$ npm run start:dev
```

### Build and Run Docker container locally

```bash
# build command
$ docker build -t dsalgo-backend .
```

```bash
# run command
$ docker run --network host -p 8080:8080 -d dsalgo-backend:latest
