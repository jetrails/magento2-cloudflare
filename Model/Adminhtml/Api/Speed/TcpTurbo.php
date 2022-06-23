<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api\Speed;

	use JetRails\Cloudflare\Model\Adminhtml\Api\Getter;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Request;

	/**
	 * This model inherits from the basic Getter model. It inherits
	 * functionality that asks the Cloudflare API for a current setting value.
	 * It then adds on to that functionality by adding more methods that
	 * interact with the Cloudflare API.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class TcpTurbo extends Getter {

		/**
		 * @var     string      _endpoint             Appended to zone endpoint
		 */
		protected $_endpoint = "";

		/**
		 * This method simply constructs a GET request to the endpoint that is
		 * most appropriate based on how this object was configured.
		 * @return  stdClass                          CF response to request
		 */
		public function getValue () {
			$endpoint = $this->getEndpoint ();
			$this->_requestModel->setType ( Request::REQUEST_GET );
			$response = $this->_requestModel->resolve ( $endpoint );
			if ( $response->success ) {
				$response->result = $response->result->plan->legacy_id;
			}
			return $response;
		}

	}
