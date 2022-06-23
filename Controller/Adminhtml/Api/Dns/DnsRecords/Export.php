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
	class Export extends Action {

		/**
		 * This action simply asks the Cloudflare API model for the bind config
		 * file based on the user's DNS configuration. This information is then
		 * returned to the visitor as raw binary data.
		 * @return  void
		 */
		public function execute () {
			return $this->_sendRaw ( $this->_api->export () );
		}

	}
