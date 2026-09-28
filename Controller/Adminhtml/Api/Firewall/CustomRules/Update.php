<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml\Api\Firewall\CustomRules;

	use JetRails\Cloudflare\Controller\Adminhtml\Action;

	/**
	 * This controller inherits from a generic controller that implements the
	 * base functionality for interfacing with a getter model. This action
	 * simply loads the initial value through the Cloudflare API. The rest of
	 * this class extends on that functionality and adds more endpoints.
	 * @version     1.4.5
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Update extends Action {

		/**
		 * This action takes in all the information that is necessary to edit a
		 * custom rule through the request parameters. It then asks the
		 * Cloudflare API model to edit said custom rule based on the id that
		 * is passed.
		 * @return  void
		 */
		public function execute () {
			$response = $this->_api->update (
				strval ( $this->_request->getParam ("id") ),
				strval ( $this->_request->getParam ("name") ),
				strval ( $this->_request->getParam ("expression") ),
				strval ( $this->_request->getParam ("action") ),
				$this->_request->getParam ("enabled") == "true",
				array (
					"ruleset" => $this->_request->getParam ("skip_ruleset") == "true",
					"phases" => ( array ) $this->_request->getParam ("skip_phases"),
					"products" => ( array ) $this->_request->getParam ("skip_products")
				),
				array (
					"content_type" => strval ( $this->_request->getParam ("content_type") ),
					"status_code" => intval ( $this->_request->getParam ("status_code") ),
					"content" => strval ( $this->_request->getParam ("content") )
				),
				$this->_request->getParam ("logging") == "true",
				strval ( $this->_request->getParam ("position") ),
				strval ( $this->_request->getParam ("target") )
			);
			return $this->_sendResponse ( $response );
		}

	}
