<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml\Api\Firewall\FirewallRules;

	use JetRails\Cloudflare\Controller\Adminhtml\Action;

	/**
	 * This controller inherits from a generic controller that implements the
	 * base functionality for interfacing with a getter model. This action
	 * simply loads the initial value through the Cloudflare API. The rest of
	 * this class extends on that functionality and adds more endpoints.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Create extends Action {

		/**
		 * This action takes in all the information that is necessary to create
		 * a firewall rule through the request parameters. It then asks the
		 * Cloudflare API model to create said firewall rule.
		 * @return  void
		 */
		public function execute () {
			$response = $this->_api->create (
				$this->_request->getParam ("name"),
				$this->_request->getParam ("expression"),
				$this->_request->getParam ("action"),
				$this->_request->getParam ("priority") == "" ? null : intval ( $this->_request->getParam ("priority") ),
				$this->_request->getParam ("paused") == "true",
				$this->_request->getParam ("products")
			);
			return $this->_sendResponse ( $response );
		}

	}
