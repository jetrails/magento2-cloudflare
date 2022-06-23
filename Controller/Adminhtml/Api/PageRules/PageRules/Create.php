<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml\Api\PageRules\PageRules;

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
		 * This method takes in all the information that is necessary for
		 * creating a page rule through the request parameters. It then asks the
		 * Cloudflare API model to create said page rule.
		 * @return  void
		 */
		public function execute () {
			$response = $this->_api->create (
				$this->_request->getParam ("target"),
				$this->_request->getParam ("actions"),
				$this->_request->getParam ("status") == "true",
				intval ( $this->_request->getParam ("priority") )
			);
			return $this->_sendResponse ( $response );
		}

	}
