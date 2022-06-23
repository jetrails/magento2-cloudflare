<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api\Firewall;

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
	class JavascriptDetections extends Setter {

		/**
		 * @var     string      _endpoint       Appended to zone endpoint
		 * @var     string      _dataKey        Key name used for value
		 * @var     integer     _settingType    Value cast type before sending
		 * @var     boolean     _usePatchToSet  Use PUT HTTP method
		 */
		protected $_endpoint = "bot_management";
		protected $_dataKey = "enable_js";
		protected $_settingType = self::TYPE_BOOLEAN;
		protected $_usePatchToSet = false;

	}
