<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml\Api\Dns\DnsRecords;

	use JetRails\Cloudflare\Controller\Adminhtml\Action;

	/**
	 * This controller inherits from a generic controller that implements the
	 * base functionality for interfacing with a getter model. This action
	 * simply loads the initial value through the Cloudflare API. The rest of
	 * this class extends on that functionality and adds more endpoints.
	 * @version     1.4.3
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Create extends Action {

		/**
		 * This method takes in all necessary information to create a DNS record
		 * and it sanitizes the data as much as it can. It then asks the
		 * Cloudflare API model to create said record.
		 * @return  void
		 */
		public function execute () {
			$response = $this->_api->createRecord (
				trim ( strtoupper ( $this->_request->getParam ("type") ) ),
				trim ( $this->_request->getParam ("name") ),
				trim ( $this->_request->getParam ("content") ),
				intval ( $this->_request->getParam ("ttl") ),
				$this->_request->getParam ("proxied") == "true",
				intval ( $this->_request->getParam ("priority") )
			);
			return $this->_sendResponse ( $response );
		}

	}
