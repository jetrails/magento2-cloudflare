<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml\Api\Dns\DnsRecords;

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
		 * This action takes in all values that are required to edit a DNS
		 * record and it asks the Cloudflare API model to change it based on the
		 * id that is passed through the request parameters.
		 * @return  void
		 */
		public function execute () {
			$response = $this->_api->editRecord (
				$this->_request->getParam ("id"),
				trim ( strtoupper ( $this->_request->getParam ("type") ) ),
				$this->_request->getParam ("name"),
				$this->_request->getParam ("content"),
				intval ( $this->_request->getParam ("ttl") ),
				$this->_request->getParam ("proxied") == "true",
				intval ( $this->_request->getParam ("priority") )
			);
			return $this->_sendResponse ( $response );
		}

	}
