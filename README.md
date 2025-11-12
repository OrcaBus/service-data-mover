Template Service
================================================================================

- [Template Service](#template-service)
  - [Service Description](#service-description)
    - [Name \& responsibility](#name--responsibility)
    - [Description](#description)
    - [Permissions \& Access Control](#permissions--access-control)
    - [Change Management](#change-management)
  - [Infrastructure \& Deployment](#infrastructure--deployment)
    - [Stateless](#stateless)
    - [CDK Commands](#cdk-commands)
    - [Stacks](#stacks)
  - [Development](#development)
    - [Project Structure](#project-structure)
    - [Setup](#setup)
      - [Requirements](#requirements)
      - [Install Dependencies](#install-dependencies)
    - [Conventions](#conventions)
    - [Linting \& Formatting](#linting--formatting)
    - [Testing](#testing)


Service Description
--------------------------------------------------------------------------------

The data mover service moves data between S3 locations.

### Name & responsibility

It is responsible for archiving data or copying it to another location.

### Description

Locally, use the data mover to move or copy data between locations:

```sh
poetry run dm move --source <SOURCE> --destination <DESTINATION>
```

This command is also deployed as a fargate task triggered by step functions.
The step functions expects as input a JSON which specifies the command (move or copy),
a source and a destination. For example, to move a specified `portalRunId` into the archive
bucket (this is probably easier in the step functions console):

```sh
export ARN=$(aws stepfunctions list-state-machines | jq -r '.stateMachines | .[] | select(.name == "orcabus-data-migrate-mover") | .stateMachineArn')
export COMMAND="move"
export SOURCE="s3://umccr-temp-dev/move_test_2"
export DESTINATION="s3://filemanager-inventory-test/move_test_2"
aws stepfunctions start-execution --state-machine-arn $ARN  --input "{\"command\" : \"$COMMAND\", \"source\": \"$SOURCE\", \"destination\": \"$DESTINATION\" }"
```

### Permissions & Access Control

This tool requires permissions to read from, put and delete from buckets.

For buckets that the data mover reads from, it requires:
* `s3:ListBucket`
* `s3:GetObject`
* `s3:GetObjectVersion`
* `s3:GetObjectTagging`
* `s3:GetObjectVersionTagging`

For buckets that data gets copied or moved to, the following it required:
* `s3:PutObject`
* `s3:PutObjectTagging`
* `s3:PutObjectVersionTagging`
* `s3:ListBucket`

And, for deleting an object from a bucket when using moves, it requires:
* `s3:DeleteObject`

The infrastructure that deploys the fargate step functions task also requires:
* `states:SendTaskSuccess`
* `states:SendTaskFailure`
* `states:SendTaskHeartbeat`

### Change Management

This service employs a CI/CD pipeline that automatically builds and releases all changes to the `main` code branch.

There are no automated changelogs or releases, however semantic versioning is followed for any manual release, and
[conventional commits][conventional-commits] are used for future automation.

[conventional-commits]: https://www.conventionalcommits.org/en/v1.0.0/

Infrastructure & Deployment
--------------------------------------------------------------------------------

The data mover deploys a simple step function that runs a fargate task to either move or copy data. This wraps the
underlying python cli defined in the [app] directory.

The nfrastructure and deployment are managed via CDK. Since this is a stateless-only service, the template provides a
stateless entrypoint: `cdk-stateless`.

[app]: app

### Stateless
- Fargate
- StepFunctions

### CDK Commands

You can access CDK commands using the `pnpm` wrapper script.

- **`cdk-stateless`**: Used to deploy stacks containing the stateless resources, which can be easily redeployed without side effects.

The type of stack to deploy is determined by the context set in the `./bin/deploy.ts` file. This ensures the correct stack is executed based on the provided context.

For example:

```sh
# Deploy a stateless stack
pnpm cdk-stateless <command>
```

### Stacks

This CDK project manages multiple stacks. The root stack (the only one that does not include `DeploymentPipeline` in its stack ID) is deployed in the toolchain account and sets up a CodePipeline for cross-environment deployments to `beta`, `gamma`, and `prod`.

To list all available stacks, run:

```sh
pnpm cdk-stateless ls
```

Example output:

```sh
OrcaBusStatelessDataMoverStack
OrcaBusStatelessDataMoverStack/DeploymentPipeline/OrcaBusBeta/DataMigrateStack (OrcaBusBeta-DataMigrateStack)
OrcaBusStatelessDataMoverStack/DeploymentPipeline/OrcaBusGamma/DataMigrateStack (OrcaBusGamma-DataMigrateStack)
OrcaBusStatelessDataMoverStack/DeploymentPipeline/OrcaBusProd/DataMigrateStack (OrcaBusProd-DataMigrateStack)
```

Development
--------------------------------------------------------------------------------

### Project Structure

The root of the project is an AWS CDK project where the main application logic lives inside the `./app` folder.

The project is organized into the following key directories:

- **`./app`**: Contains the main application logic. You can open the code editor directly in this folder, and the application should run independently.

- **`./bin/deploy.ts`**: Serves as the entry point of the application. It initializes the `stateless` stack.

- **`./infrastructure`**: Contains the infrastructure code for the project:
  - **`./infrastructure/toolchain`**: Includes stacks for the stateless and stateful resources deployed in the toolchain account. These stacks primarily set up the CodePipeline for cross-environment deployments.
  - **`./infrastructure/stage`**: Defines the stage stacks for different environments:
    - **`./infrastructure/stage/config.ts`**: Contains environment-specific configuration files (e.g., `beta`, `gamma`, `prod`).
    - **`./infrastructure/stage/stack.ts`**: The CDK stack entry point for provisioning resources required by the application in `./app`.

- **`.github/workflows/pr-tests.yml`**: Configures GitHub Actions to run tests for `make check` (linting and code style), tests defined in `./test`, and `make test` for the `./app` directory. Modify this file as needed to ensure the tests are properly configured for your environment.

- **`./test`**: Contains tests for CDK code compliance against `cdk-nag`. You should modify these test files to match the resources defined in the `./infrastructure` folder.

### Setup

#### Requirements

```sh
node --version
v22.9.0

# Update Corepack (if necessary, as per pnpm documentation)
npm install --global corepack@latest

# Enable Corepack to use pnpm
corepack enable pnpm
```

#### Install Dependencies

To install all required dependencies, run:

```sh
make install
```

### Conventions

### Linting & Formatting

Automated checks are enforces via pre-commit hooks, ensuring only checked code is committed. For details consult the `.pre-commit-config.yaml` file.

Manual, on-demand checking is also available via `make` targets (see below). For details consult the `Makefile` in the root of the project.


To run linting and formatting checks on the root project, use:

```sh
make check
```

To automatically fix issues with ESLint and Prettier, run:

```sh
make fix
```

### Testing

Test code is hosted alongside business in `/tests/` directories.

```sh
make test
```
