<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml;

	use JetRails\Cloudflare\Controller\Adminhtml\Getter;

	/**
	 * This class inherits from the Getter class and therefore, has an index
	 * action. The main action in this class is the update action which simply
	 * passes the value straight to the API model.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Update extends Action {

		/**
		 * This action reads the value parameter and simply passes it on to the
		 * appropriate API model. This API model is determined by the endpoint
		 * that was visited.
		 * @return 	void
		 */
		public function execute () {
			$value = $this->_request->getParam ("value");
			$response = $this->_api->setValue ( $value );
			return $this->_sendResponse ( $response );
		}

	}
