<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml\Api\Firewall\CustomRules;

	use JetRails\Cloudflare\Controller\Adminhtml\Action;

	/**
	 * This controller inherits from a generic controller that implements the
	 * base functionality for interfacing with a getter model. This action
	 * simply loads the initial value through the Cloudflare API. The rest of
	 * this class extends on that functionality and adds more endpoints.
	 * @version     1.4.6
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Position extends Action {

		/**
		 * This action takes in a custom rule id, a position, and a target rule
		 * id through the request parameters. It then asks the Cloudflare API
		 * model to move the custom rule with the corresponding id without
		 * changing its definition.
		 * @return  void
		 */
		public function execute () {
			$response = $this->_api->position (
				strval ( $this->_request->getParam ("id") ),
				strval ( $this->_request->getParam ("position") ),
				strval ( $this->_request->getParam ("target") )
			);
			return $this->_sendResponse ( $response );
		}

	}
