<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api;

	use JetRails\Cloudflare\Model\Adminhtml\Api\Overview\Configuration;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Request;

	/**
	 * This class is a parent class that child classes inherit from. It
	 * implements functionality to easily get a setting value from Cloudflare
	 * using their API.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Getter {

		/**
		 * @var     string       _endpoint            Postfixed to zone endpoint
		 */
		protected $_endpoint = "";
		protected $_configurationModel;
		protected $_requestModel;

		public function __construct (
			Configuration $configurationModel,
			Request $requestModel
		) {
			$this->_configurationModel = $configurationModel;
			$this->_requestModel = $requestModel;
		}

		/**
		 * This method takes in an optional endpoint that will override the one
		 * that is stored internally. That value is then appended to the zone
		 * endpoint.
		 * @param   mixed        endpoint             Override internal endpoint
		 * @return  string                            Resulting endpoint
		 */
		protected function getEndpoint ( $endpoint = false ) {
			$endpoint = $endpoint ? $endpoint : $this->_endpoint;
			$zoneId = $this->_configurationModel->getZoneId ();
			return sprintf ( "zones/%s/%s", $zoneId, $endpoint );
		}

		/**
		 * This method simply constructs a GET request to the endpoint that is
		 * most appropriate based on how this object was configured.
		 * @return  stdClass                          CF response to request
		 */
		public function getValue () {
			$endpoint = $this->getEndpoint ();
			$this->_requestModel->setType ( Request::REQUEST_GET );
			return $this->_requestModel->resolve ( $endpoint );
		}

	}
