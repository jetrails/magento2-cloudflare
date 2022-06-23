<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml\Api\Firewall\AccessRules;

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
	class Edit extends Action {

		/**
		 * This action takes in an access rule id and a note through the request
		 * parameters. It then asks the Cloudflare API model to update the note.
		 * @return  void
		 */
		public function execute () {
			$response = $this->_api->updateNote (
				$this->_request->getParam ("id"),
				$this->_request->getParam ("note")
			);
			return $this->_sendResponse ( $response );
		}

	}
