<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api\Caching;

	use JetRails\Cloudflare\Model\Adminhtml\Api\Overview\Configuration;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Request;

	/**
	 * This model is communicates with the Cloudflare API. It particular, it
	 * uses certain endpoints to purge everything that is related to a certain
	 * zone and it also asks the Cloudflare API to purge the cache for an array
	 * of specific URLs.
	 * @version     1.4.0
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
		 * Given a list of items, ask Cloudflare to purge cache that matches the
		 * list of urls.
		 * @param   array        items                Items to purge
		 * @return  stdClass                          Cloudflare response
		 */
		public function purgeUrls ( $items ) {
			$zoneId = $this->_configurationModel->getZoneId ();
			$endpoint = sprintf ( "zones/%s/purge_cache", $zoneId );
			$this->_requestModel->setType ( Request::REQUEST_DELETE );
			$this->_requestModel->setData ( array ( "files" => $items ) );
			return $this->_requestModel->resolve ( $endpoint );
		}

		/**
		 * Given a list of items, ask Cloudflare to purge cache that matches the
		 * list of hostnames.
		 * @param   array        items                Items to purge
		 * @return  stdClass                          Cloudflare response
		 */
		public function purgeHosts ( $items ) {
			$zoneId = $this->_configurationModel->getZoneId ();
			$endpoint = sprintf ( "zones/%s/purge_cache", $zoneId );
			$this->_requestModel->setType ( Request::REQUEST_DELETE );
			$this->_requestModel->setData ( array ( "hosts" => $items ) );
			return $this->_requestModel->resolve ( $endpoint );
		}

		/**
		 * Given a list of items, ask Cloudflare to purge cache that matches the
		 * list of tags.
		 * @param   array        items                Items to purge
		 * @return  stdClass                          Cloudflare response
		 */
		public function purgeTags ( $items ) {
			$zoneId = $this->_configurationModel->getZoneId ();
			$endpoint = sprintf ( "zones/%s/purge_cache", $zoneId );
			$this->_requestModel->setType ( Request::REQUEST_DELETE );
			$this->_requestModel->setData ( array ( "tags" => $items ) );
			return $this->_requestModel->resolve ( $endpoint );
		}

		/**
		 * Given a list of items, ask Cloudflare to purge cache that matches the
		 * list of prefixes.
		 * @param   array        items                Items to purge
		 * @return  stdClass                          Cloudflare response
		 */
		public function purgePrefixes ( $items ) {
			$zoneId = $this->_configurationModel->getZoneId ();
			$endpoint = sprintf ( "zones/%s/purge_cache", $zoneId );
			$this->_requestModel->setType ( Request::REQUEST_DELETE );
			$this->_requestModel->setData ( array ( "prefixes" => $items ) );
			return $this->_requestModel->resolve ( $endpoint );
		}

	}
