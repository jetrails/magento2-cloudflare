# Magento 2 — Cloudflare — By [JetRails](https://jetrails.com)
> Interact with popular Cloudflare features though Magento's backend portal.

![](https://img.shields.io/badge/License-MIT-orange.svg?style=for-the-badge)
![](https://img.shields.io/badge/Version-1.4.0-orange.svg?style=for-the-badge)
![](https://img.shields.io/badge/Stability-Stable-orange.svg?style=for-the-badge)
![](https://img.shields.io/badge/Magento-2-orange.svg?style=for-the-badge)

<p align="center" >
	<img src="docs/images/preview.png" width="100%" />
</p>

## Documentation

The user guide can be found [here](https://learn.jetrails.com/article/magento-2-cloudflare-extension).  The user guide goes through the installation process as well as explains all the features that comes with this extension. For further support, please email [development@jetrails.com](mailto://development@jetrails.com).

## Build System

A simple [Makefile](Makefile) is used as a build system. Run `make help` to see available commands.

## Development Environment

We use a super simple development environment that is ephemeral. You can spin it up by doing the following:

```shell
docker compose up -d
docker compose logs -f
docker compose down # destroy environment
```

You can deploy the module into the development environment by running the following:

```shell
make clean
make build
make deploy
```

You can then access the magento container by running the following:

```shell
docker compose exec magento bash
```

Once in the container you can run the standard commands to install the module:

```shell
magento setup:upgrade
magento setup:di:compile
```

The Magento site is hosted on http://localhost and the backend can be reached at http://localhost/admin. Default user name is `jetrails` and default password is `magento2`.
