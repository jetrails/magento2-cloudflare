<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api\Overview;

	use JetRails\Cloudflare\Helper\Adminhtml\Data;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Request;
	use Magento\Framework\Session\SessionManagerInterface;

	/**
	 * This class handles the logic to authenticate a zone/token pair through
	 * the use of the Cloudflare API. It also has a very popular method that
	 * retrieves the currently selected domain's zone id.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Configuration {

		protected $_session;
		protected $_request;
		protected $_data;

		public function __construct (
			Data $data,
			Request $request,
			SessionManagerInterface $session
		) {
			$this->_data = $data;
			$this->_request = $request;
			$this->_session = $session;
		}

		/**
		 * This method takes in a zone and a token. It then makes an API call
		 * to Cloudflare and finds out if the supplied zone and token is valid.
		 * @return  boolean                          Is user authenticated?
		 */
		public function validateAuth () {
			$this->_request->setType ( Request::REQUEST_GET );
			$response = $this->_request->resolve ("user/tokens/verify");
			if ( is_object ( $response ) && isset ( $response->success ) && $response->success ) {
				$zone = $this->getZoneId ();
				$response = $this->_request->resolve ("zones/$zone");
				return is_object ( $response ) && isset ( $response->success ) && $response->success;
			}
			return false;
		}

		/**
		 * This method is public facing and is used to return the zone id of the
		 * currently selected domain.
		 * @return  string                           CF authentication zone
		 */
		public function getZoneId () {
			return $this->_data->getAuthZone ();
		}

	}
