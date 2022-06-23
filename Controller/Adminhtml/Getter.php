<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml;

	use JetRails\Cloudflare\Controller\Adminhtml\Action;

	/**
	 * This generic controller class implements the index action and makes it
	 * behave as the getter method. Based on the controller name, it fetches the
	 * currently stored value though the interaction of the Cloudflare API and
	 * the controller's respective model.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Getter extends Action {

		/**
		 * The default index action is used to implement the getter action. This
		 * action will look at the controller name and based on it's name, it
		 * will instantiate the corresponding model. It will then ask the model
		 * to fetch the current value that is stored in Cloudflare.
		 * @return  void
		 */
		public function execute () {
			$response = $this->_api->getValue ();
			return $this->_sendResponse ( $response );
		}

	}
