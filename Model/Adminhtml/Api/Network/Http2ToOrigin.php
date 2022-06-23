<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api\Network;

	use JetRails\Cloudflare\Model\Adminhtml\Api\Request;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Setter;

	/**
	 * This model class inherits from the Setter model.  It essentially wraps
	 * that class in order to send passed data to the Cloudflare API endpoint.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Http2ToOrigin extends Setter {

		public function getValue () {
			$zoneId = $this->_configurationModel->getZoneId ();
			$endpoint = sprintf ( "zones/%s/%s", $zoneId, "origin_max_http_version" );
			$this->_requestModel->setType ( Request::REQUEST_GET );
			$response = $this->_requestModel->resolve ( $endpoint );
			if ( isset ( $response ) && isset ( $response->result ) && isset ( $response->result->value ) ) {
				$response->result->value = $response->result->value === "2" ? "on" : "off";
			}
			return $response;
		}

		public function setValue ( $value ) {
			$zoneId = $this->_configurationModel->getZoneId ();
			$endpoint = sprintf ( "zones/%s/%s", $zoneId, "origin_max_http_version" );
			$this->_requestModel->setType ( Request::REQUEST_PATCH );
			$this->_requestModel->setData ( array ( "value" => $value ? "2" : "1" ) );
			return $this->_requestModel->resolve ( $endpoint );
		}

	}
