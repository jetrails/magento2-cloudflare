<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api\Speed;

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
	class AutomaticPlatformOptimization extends Setter {

		/**
		 * @var     string      _endpoint       Appended to zone endpoint
		 * @var     string      _dataKey        Key name used for value
		 * @var     integer     _settingType    Value cast type before sending
		 */
		protected $_endpoint = "settings/automatic_platform_optimization";
		protected $_dataKey = "value";
		protected $_settingType = self::TYPE_BOOLEAN;

		/**
		 * This method takes in a value of mixed type and based on the setting
		 * type, that value is cast and sent though the Cloudflare API to be
		 * changed.
		 * @param   mixed        value                Value to pass to setting
		 */
		public function setValue ( $value ) {
			$value = $this->_castValue ( $value );
			$zoneId = $this->_configurationModel->getZoneId ();
			$endpoint = sprintf ( "zones/%s/%s", $zoneId, $this->_endpoint );
			$this->_requestModel->setType ( $this->_usePatchToSet ? Request::REQUEST_PATCH : Request::REQUEST_PUT );
			$this->_requestModel->setData ( array ( "$this->_dataKey" => array ( "enabled" => $value ) ) );
			return $this->_requestModel->resolve ( $endpoint );
		}

	}
