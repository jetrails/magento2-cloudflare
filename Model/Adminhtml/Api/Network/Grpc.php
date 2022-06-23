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
	class Grpc extends Setter {
		
		public function getValue () {
			$zoneId = $this->_configurationModel->getZoneId ();
			$endpoint = sprintf ( "zones/%s/%s", $zoneId, "flags" );
			$this->_requestModel->setType ( Request::REQUEST_GET );
			$response = $this->_requestModel->resolve ( $endpoint );
			$value = null;
			if ( 
				isset ( $response ) &&
				isset ( $response->result ) &&
				isset ( $response->result->protocols ) &&
				isset ( $response->result->protocols->gRPC )
			) {
				$value = $response->result->protocols->gRPC ? "on" : "off";
			}
			return array ( "result" => array ( "value" => $value ) );
		}

		public function setValue ( $value ) {
			$zoneId = $this->_configurationModel->getZoneId ();
			$endpoint = sprintf ( "zones/%s/%s", $zoneId, "flags/products/protocols/changes" );
			$this->_requestModel->setType ( Request::REQUEST_POST );
			$this->_requestModel->setData ( array ( "feature" => "gRPC", "value" => $value ) );
			return $this->_requestModel->resolve ( $endpoint );
		}

	}
