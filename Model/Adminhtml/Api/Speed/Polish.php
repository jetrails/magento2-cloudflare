<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api\Speed;

	use JetRails\Cloudflare\Model\Adminhtml\Api\Getter;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Overview\Configuration;
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
	class Polish extends Getter {

		/**
		 * @var     string      _endpoint             Appended to zone endpoint
		 */
		protected $_endpoint = "settings/polish";
		protected $_requestModel;
		protected $_configurationModel;

		public function __construct (
			Configuration $configurationModel,
			Request $requestModel
		) {
			parent::__construct ( $configurationModel, $requestModel );
			$this->_requestModel = $requestModel;
			$this->_configurationModel = $configurationModel;
		}

		/**
		 * This method contacts the Cloudflare API and asks for the current
		 * value for the webp setting.
		 * @return  stdClass                          CF response to request
		 */
		public function getWebP () {
			$endpoint = $this->getEndpoint ("settings/webp");
			$this->_requestModel->setType ( Request::REQUEST_GET );
			return $this->_requestModel->resolve ( $endpoint );
		}

		/**
		 * This method takes in a value for the polish setting and a value for
		 * the webp setting. It then attempts to updates the values using the
		 * Cloudflare API. This is done through two API requests.
		 * @param   boolean      value                The value for polish
		 * @param   boolean      webp                 The value for webp
		 * @return  stdClass                          CF response to request
		 */
		public function change ( $value, $webp ) {
			$endpoint = $this->getEndpoint ();
			$this->_requestModel->setType ( Request::REQUEST_PATCH );
			$this->_requestModel->setData ( array ( "value" => $value ) );
			$response = $this->_requestModel->resolve ( $endpoint );
			$zoneId = $this->_configurationModel->getZoneId ();
			if ( is_object ( $response ) && isset ( $response->success ) && $response->success && $value != "off" ) {
				$endpoint = sprintf ( "zones/%s/settings/webp", $zoneId );
				$this->_requestModel->setType ( Request::REQUEST_PATCH );
				$this->_requestModel->setData ( array (
					"value" => $webp ? "on" : "off"
				));
				$response = $this->_requestModel->resolve ( $endpoint );
			}
			return $response;
		}

	}
