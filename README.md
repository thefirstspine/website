# Website service

The website of The First Spine. A [Sails v1](https://sailsjs.com) application.

## Installation

```
npm ci
```

## Running the app

Prefer using the Sails CLI (`npm install sails -g`) to start the application.

```
sails lift
```

## Build & run for production

```
npm run start
```

## Configuration

See the configuration keys with the [Ansible playbook](https://github.com/thefirstspine/ansible/blob/master/volume/playbooks/deploy-website.yaml)

To help you configure your local environment to generate a dotenv file you can use the [configurator](https://github.com/thefirstspine/configurator) using this command:

```
node configurator.js create website --conf-path [local copy of ansible volume]/conf --force-http true
```
