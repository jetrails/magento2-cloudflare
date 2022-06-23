<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml\Api\Speed\Polish;

	use JetRails\Cloudflare\Controller\Adminhtml\Action;

	/**
	 * This controller inherits from the base action class and it inherits
	 * helper methods that are contained within it. This controller contains two
	 * actions. One gets the values for the polish and webp settings and the
	 * other changes them.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Index extends Action {

		/**
		 * This action asks the Cloudflare API model for the value of the polish
		 * setting and the value of the webp setting. It then combines both
		 * responses and sends it back to the caller.
		 * @return  void
		 */
		public function execute () {
			$responseValue = $this->_api->getValue ();
			$responseWebP = $this->_api->getWebP ();
			return $this->_sendResponse ( array (
				"state" => $responseValue,
				"webp" => $responseWebP
			));
		}

	}
