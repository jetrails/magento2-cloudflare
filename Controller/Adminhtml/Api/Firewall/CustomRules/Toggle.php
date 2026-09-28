<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml\Api\Firewall\CustomRules;

	use JetRails\Cloudflare\Controller\Adminhtml\Action;

	/**
	 * This controller inherits from a generic controller that implements the
	 * base functionality for interfacing with a getter model. This action
	 * simply loads the initial value through the Cloudflare API. The rest of
	 * this class extends on that functionality and adds more endpoints.
	 * @version     1.4.5
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Toggle extends Action {

		/**
		 * This action takes in a custom rule id and the desired state through
		 * the request parameters. It then asks the Cloudflare API model to
		 * enable or disable the custom rule with the corresponding id.
		 * @return  void
		 */
		public function execute () {
			$response = $this->_api->toggle (
				strval ( $this->_request->getParam ("id") ),
				$this->_request->getParam ("state") == "true"
			);
			return $this->_sendResponse ( $response );
		}

	}
