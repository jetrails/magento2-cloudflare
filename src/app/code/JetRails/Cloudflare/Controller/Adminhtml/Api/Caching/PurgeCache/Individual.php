<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml\Api\Caching\PurgeCache;

	use JetRails\Cloudflare\Controller\Adminhtml\Action;

	/**
	 * This controller has two endpoints. One is used to send an API call to
	 * Cloudflare and it purges all the cache for the current domain. The other
	 * endpoint asks the Cloudflare API to purge certain files from a zone.
	 * @version     1.1.1
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Individual extends Action {

		/**
		 * This action takes in a list of files from the 'files' parameter and
		 * it asks the Cloudflare API to purge the cache related to said files.
		 * @return 	void
		 */
		public function execute () {
			$files = $this->_request->getParam ("files");
			$response = $this->_api->purgeIndividual ( $files );
			if ( $response->success ) {
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
