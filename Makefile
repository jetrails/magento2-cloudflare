VENDOR=JetRails
MODULE=Cloudflare
NAMESPACE=$(VENDOR)_$(MODULE)
NAMESPACE_PATH=$(VENDOR)/$(MODULE)
VERSION=$(shell git describe --tags `git rev-list --tags --max-count=1`)
MODULE_FILES=Block Console Controller Helper Model etc view registration.php
MODULE_FILES_EXTRA=composer.json LICENSE.md

.PHONY: deps build bump deploy package clean help

deps: ## Download dependencies
	yarn install

build: ## Build styles and scripts
	yarn build
	rm -rf ./build/$(NAMESPACE_PATH)
	mkdir -p ./build/$(NAMESPACE_PATH)
	rsync -uavq $(MODULE_FILES) ./build/$(NAMESPACE_PATH)

bump: ## Bump version in source files based on latest git tag
	VERSION=$(VERSION); find Block Console Controller Helper Model etc view -type f -iname "*.php" -exec sed -E -i '' "s/([\t ]+\*[\t ]+@version[\t ]+)(.*)/\1$$VERSION/g" {} +
	VERSION=$(VERSION); sed -E -i '' "s/(Version-)(.+)(-orange)/\1$$VERSION\3/g" ./README.md
	VERSION=$(VERSION); sed -E -i '' "s/(\"version\": \")(.+)(\")/\1$$VERSION\3/g" ./composer.json
	VERSION=$(VERSION); sed -E -i '' "s/(\"version\": \")(.+)(\")/\1$$VERSION\3/g" ./package.json

deploy: build ## Deploy code to docker container
	docker compose exec magento rm -rf /bitnami/magento/app/code/$(NAMESPACE_PATH)
	docker compose exec magento mkdir -p /bitnami/magento/app/code/$(NAMESPACE_PATH)
	docker compose cp ./build/$(NAMESPACE_PATH) magento:/bitnami/magento/app/code/$(VENDOR)
	docker compose exec magento chown -R daemon:root /bitnami/magento/app/code

package: bump build ## Package into archive file
	rm -rf ./dist
	mkdir -p ./dist
	zip -r dist/$(NAMESPACE)-$(VERSION).zip $(MODULE_FILES) $(MODULE_FILES_EXTRA)

clean: ## Remove generated files and folders
	rm -rf ./dist ./build ./.parcel-cache

help: ## Display available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
