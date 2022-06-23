<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api\Speed;

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
	class Mirage extends Setter {

		/**
		 * @var     string      _endpoint       Appended to zone endpoint
		 * @var     string      _dataKey        Key name used for value
		 * @var     integer     _settingType    Value cast type before sending
		 */
		protected $_endpoint = "settings/mirage";
		protected $_dataKey = "value";
		protected $_settingType = self::TYPE_SWITCH;

	}
