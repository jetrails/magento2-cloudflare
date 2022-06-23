<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api\Caching;

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
	class ArgoTieredCache extends Setter {

		public function getValue () {
			$zoneId = $this->_configurationModel->getZoneId ();
			$endpoint = sprintf ( "zones/%s/%s", $zoneId, "argo/tiered_caching" );
			$this->_requestModel->setType ( Request::REQUEST_GET );
			return $this->_requestModel->resolve ( $endpoint );
		}

		public function setValue ( $value ) {
			$zoneId = $this->_configurationModel->getZoneId ();
			$endpoint = sprintf ( "zones/%s/%s", $zoneId, "argo/tiered_caching" );
			$this->_requestModel->setType ( Request::REQUEST_PATCH );
			$this->_requestModel->setData ( array ( "value" => $value ? "on" : "off" ) );
			return $this->_requestModel->resolve ( $endpoint );
		}

	}
