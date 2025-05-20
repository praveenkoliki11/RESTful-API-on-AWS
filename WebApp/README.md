
## Technology Stack

### Backend: Node.js
### Database: MySQL

## Build Instructions

1. In Command Prompt, clone the project using ' git clone https://github.com/praveenkoliki11/RESTful-API-on-AWS.git '
2. Enter the folder in your local `yourpath/webapp/`
3. run `npm install`
4. run application by `npm run both`

## Deploy Instructions
### Prerequisite tools and environment
1. `Node.js `
2. `npm `
3. `MySQL `

## Running Tests
1. Enter the folder in your local `yourpath/webapp/`
2. run `npm install`
3. run `npm test`

## CI/CD

## Initiate AMI in dev:

(in local test, run `export AWS_PROFILE=dev` or `export AWS_PROFILE=demo` before initiation)
1. `packer fmt -var-file=packer/ami.pkrvars.hcl packer/ami.pkr.hcl`
2. `packer init -var-file=packer/ami.pkrvars.hcl packer/ami.pkr.hcl`
3. `packer validate -var-file=packer/ami.pkrvars.hcl packer/ami.pkr.hcl`                                                            
4. `packer build -var-file=packer/ami.pkrvars.hcl packer/ami.pkr.hcl`  

## Libraries used:
#### For Server:
1. bcrypt
2. jest
3. express
4. nodemon
5. mysql2
6. supertest
7. winston
8. sequelize
9.  @aws-sdk/client-s3
10. node-statsd


