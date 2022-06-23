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
	class AutoMinify extends Getter {

		/**
		 * @var     string      _endpoint             Appended to zone endpoint
		 */
		protected $_endpoint = "settings/minify";
		protected $_requestModel;

		public function __construct (
			Configuration $configurationModel,
			Request $requestModel
		) {
			parent::__construct ( $configurationModel, $requestModel );
			$this->_requestModel = $requestModel;
		}

		/**
		 * This method takes in boolean values that represent whether auto
		 * minification is turned on for js, css, and html. These values are
		 * then changed though Cloudflare's API.
		 * @param   boolean      js                   Is JS minification on?
		 * @param   boolean      css                  Is CSS minification on?
		 * @param   boolean      html                 Is HTML minification on?
		 * @return  stdClass                          CF response to request
		 */
		public function change ( $js, $css, $html ) {
			$endpoint = $this->getEndpoint ();
			$this->_requestModel->setType ( Request::REQUEST_PATCH );
			$this->_requestModel->setData ( array ( "value" => array (
				"js" => $js == "true" ? "on" : "off",
				"css" => $css == "true" ? "on" : "off",
				"html" => $html == "true" ? "on" : "off"
			)));
			return $this->_requestModel->resolve ( $endpoint );
		}

	}
