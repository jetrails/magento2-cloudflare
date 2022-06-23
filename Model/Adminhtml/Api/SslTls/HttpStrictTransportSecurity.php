<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api\SslTls;

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
	class HttpStrictTransportSecurity extends Getter {

		/**
		 * @var     string      _endpoint             Appended to zone endpoint
		 */
		protected $_endpoint = "settings/security_header";
		protected $_requestModel;

		public function __construct (
			Configuration $configurationModel,
			Request $requestModel
		) {
			parent::__construct ( $configurationModel, $requestModel );
			$this->_requestModel = $requestModel;
		}

		/**
		 * This method takes in a configuration object that defines the options
		 * that need to be set for the HSTS setting.
		 * @param   stdClass    conf                  Configuration to set
		 * @return  stdClass                          Cloudflare response
		 */
		public function setValue ( $conf ) {
			$conf = array (
				"enabled" => $conf ["enabled"] === "true",
				"max_age" => intval ( $conf ["max_age"] ),
				"include_subdomains" => $conf ["include_subdomains"] === "true",
				"preload" => $conf ["preload"] === "true",
				"nosniff" => $conf ["nosniff"] === "true"
			);
			$endpoint = $this->getEndpoint ();
			$this->_requestModel->setType ( Request::REQUEST_PATCH );
			$this->_requestModel->setData ( array ( "value" => array (
				"strict_transport_security" => $conf
			)));
			return $this->_requestModel->resolve ( $endpoint );
		}

	}
