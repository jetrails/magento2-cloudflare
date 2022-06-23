<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml\Api\Caching\PurgeCache;

	use JetRails\Cloudflare\Controller\Adminhtml\Action;

	/**
	 * This action is used to send an API call to Cloudflare and request to
	 * purge cache for the current domain.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Hostname extends Action {

		/**
		 * This action simply triggers the Cloudflare API to purge cache related
		 * to the list of items that are passed.
		 * @return  void
		 */
		public function execute () {
			$items = $this->_request->getParam ("items");
			$response = $this->_api->purgeHosts ( $items );
			if ( is_object ( $response ) && isset ( $response->success ) && $response->success ) {
				$response->messages = array_merge (
					array (
						"Successfully purged assets. Please allow up to 30 " .
						"seconds for changes to take effect."
					),
					$response->messages
				);
			}
			return $this->_sendResponse ( $response );
		}

	}
