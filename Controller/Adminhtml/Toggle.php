<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml;

	use JetRails\Cloudflare\Controller\Adminhtml\Action;

	/**
	 * This class inherits from the Getter class and therefore, has an index
	 * action. The main action in this class is the toggle action which takes
	 * the passed value and casts it into a boolean value. That value is then
	 * passed straight to the API model.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Toggle extends Action {

		/**
		 * This action reads the value parameter and simply casts the value into
		 * a boolean. After that, it passes that boolean value to the
		 * appropriate API model. This API model is determined by the endpoint
		 * that was visited.
		 * @return 	void
		 */
		public function execute () {
			$state = $this->_request->getParam ("state");
			$response = $this->_api->setValue ( $state === "true" );
			return $this->_sendResponse ( $response );
		}

	}
