<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml\Api\Caching\PurgeCache;

	use JetRails\Cloudflare\Controller\Adminhtml\Action;

	/**
	 * This controller has two endpoints. One is used to send an API call to
	 * Cloudflare and it purges all the cache for the current domain. The other
	 * endpoint asks the Cloudflare API to purge certain files from a zone.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Everything extends Action {

		/**
		 * This action simply triggers the Cloudflare API to purge all the cache
		 * related to the zone.
		 * @return 	void
		 */
		public function execute () {
			$response = $this->_api->purgeEverything ();
			if ( is_object ( $response ) && isset ( $response->success ) && $response->success ) {
				$response->messages = array_merge (
					array (
						"Successfully purged all assets. Please allow up to " .
						"30 seconds for changes to take effect."
					),
					$response->messages
				);
			}
			return $this->_sendResponse ( $response );
		}

	}
