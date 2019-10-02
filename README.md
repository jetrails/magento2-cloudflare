# Magento 2 — Cloudflare — By [JetRails](https://jetrails.com)
> Interact with popular Cloudflare features though Magento's backend portal.

![](https://img.shields.io/badge/License-MIT-orange.svg?style=for-the-badge)
![](https://img.shields.io/badge/Version-1.2.1-orange.svg?style=for-the-badge)
![](https://img.shields.io/badge/Stability-Stable-orange.svg?style=for-the-badge)
![](https://img.shields.io/badge/Magento-2-orange.svg?style=for-the-badge)

<p align="center" >
	<img src="docs/images/preview.png" width="100%" />
</p>

## Documentation
The user guide can be found [here](https://learn.jetrails.com/article/magento-2-cloudflare-extension).  The user guide goes through the installation process as well as explains all the features that comes with this extension. For further support, please email [development@jetrails.com](mailto://development@jetrails.com).

## Build System
This extension uses __Gulp__ as it's build system.  Gulp is a package that can be easily downloaded using __NPM__ or __Yarn__.  Once this repository is cloned, run `npm install gulp -g` followed by `npm install` or `yarn install` to install Gulp and all Gulp modules used within this build system.  Please refer to the following table for a description of some useful Gulp commands. A typical Gulp command takes the following form: `gulp <command>`.

| Command   | Description                                                                             |
|-----------|-----------------------------------------------------------------------------------------|
|   `init`  | Creates build, staging, and distribution directories                                    |
|  `clean`  | Deletes build and distribution directories                                              |
|   `bump`  | Bumps version number in source files to reflect version found in package.json           |
|  `build`  | Builds and copies files from source directory to the build directory                    |
|  `deploy` | Copies files from build directory to the staging directory                              |
|  `watch`  | Watches files in source directory and executes `deploy` on file change                  |
| `package` | Updates package.xml with file hashes and packages extension into distribution directory |

## Docker Environment
This project comes with a [docker-compose.yml](docker-compose.yml) and a [docker-sync.yml](docker-sync.yml) file, which can be used to spin up a Magento 1 development environment. In order to use docker, please make sure you have **Docker**, **Docker Compose**, and **Docker Sync** installed. For information about configuring this docker environment, please refer to it's Github repository which can be found [here](https://github.com/jetrails/docker-magento-alpine).
