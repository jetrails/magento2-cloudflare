<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml\Api\Firewall\UserAgentBlocking;

	use JetRails\Cloudflare\Controller\Adminhtml\Action;

	/**
	 * This controller inherits from a generic controller that implements the
	 * base functionality for interfacing with a getter model. This action
	 * simply loads the initial value through the Cloudflare API. The rest of
	 * this class extends on that functionality and adds more endpoints.
	 * @version     1.3.1
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Edit extends Action {

		/**
		 * This action takes in all the information that is necessary to edit a
		 * user agent rule through the request parameters. It then asks the
		 * Cloudflare API model to edit said user agent rule based on the id
		 * that is passed.
		 * @return  void
		 */
		public function execute () {
			$response = $this->_api->update (
				$this->_request->getParam ("id"),
				$this->_request->getParam ("mode"),
				$this->_request->getParam ("paused") == "true",
				$this->_request->getParam ("value"),
				$this->_request->getParam ("description")
			);
			return $this->_sendResponse ( $response );
		}

	}
