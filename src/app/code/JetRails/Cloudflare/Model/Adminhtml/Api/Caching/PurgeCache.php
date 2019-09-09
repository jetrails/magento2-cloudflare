<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api\Caching;

	use JetRails\Cloudflare\Model\Adminhtml\Api\Overview\Configuration;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Request;

	/**
	 * This model is communicates with the Cloudflare API. It particular, it
	 * uses certain endpoints to purge everything that is related to a certain
	 * zone and it also asks the Cloudflare API to purge the cache for an array
	 * of specific URLs.
	 * @version     1.2.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class PurgeCache {

		protected $_configurationModel;
		protected $_requestModel;

		public function __construct (
			Configuration $configurationModel,
			Request $requestModel
		) {
			$this->_configurationModel = $configurationModel;
			$this->_requestModel = $requestModel;
		}

		/**
		 * This method asks the Cloudflare API to purge all the cache that is
		 * associated with the currently selected zone.
		 * @return  stdClass                          Cloudflare response
		 */
		public function purgeEverything () {
			$zoneId = $this->_configurationModel->getZoneId ();
			$endpoint = sprintf ( "zones/%s/purge_cache", $zoneId );
			$this->_requestModel->setType ( Request::REQUEST_DELETE );
			$this->_requestModel->setData ( array ( "purge_everything" => true ) );
			return $this->_requestModel->resolve ( $endpoint );
		}

		/**
		 * This method asks the Cloudflare API to purge all the cache in the
		 * currently selected zone and that match any of the URLs found in the
		 * passed array.
		 * @param   array        urls                 URLs to purge in zone
		 * @return  stdClass                          Cloudflare response
		 */
		public function purgeIndividual ( $urls ) {
			$zoneId = $this->_configurationModel->getZoneId ();
			$endpoint = sprintf ( "zones/%s/purge_cache", $zoneId );
			$this->_requestModel->setType ( Request::REQUEST_DELETE );
			$this->_requestModel->setData ( array ( "files" => $urls ) );
			return $this->_requestModel->resolve ( $endpoint );
		}

	}
