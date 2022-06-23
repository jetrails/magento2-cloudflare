<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api\Firewall;

	use JetRails\Cloudflare\Model\Adminhtml\Api\Getter;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Request;

	/**
	 * This model inherits from the basic Getter model. It inherits
	 * functionality that asks the Cloudflare API for a current setting value.
	 * It then adds on to that functionality by adding more methods that
	 * interact with the Cloudflare API.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class ZoneLockdown extends Getter {

		/**
		 * @var     string      _endpoint             Appended to zone endpoint
		 * @var     boolean     _usePatchToSet        Use PUT HTTP method
		 */
		protected $_endpoint = "firewall/lockdowns";
		protected $_usePatchToSet = false;

		/**
		 * This method wraps the parent method because we want to get the value
		 * that the parent returns and then append the entitlements result to
		 * it.
		 * @return  stdClass                          CF response to request
		 */
		public function getValue () {
			$result = (array) parent::getValue ();
			$result ["entitlements"] = $this->getEntitlements ();
			return (object) $result;
		}

		/**
		 * This method simply contacts the Cloudflare API and asks for a list of
		 * entitlements. It then only returns the entitlements that are related
		 * to page rules.
		 * @return  stdClass                          CF response to request
		 */
		public function getEntitlements () {
			$endpoint = $this->getEndpoint ("entitlements");
			$this->_requestModel->setType ( Request::REQUEST_GET );
			$response = $this->_requestModel->resolve ( $endpoint );
			return current ( array_filter ( $response->result, function ( $i ) {
				return $i->id === "zonelockdown.max_rules";
			}));
		}

		/**
		 * This method takes in information about a zone lockdown and creates it
		 * using Cloudflare's API.
		 * @param   string       desc                 Zone lockdown description
		 * @param   array        urls                 Array of URLs to use
		 * @param   array        config               Mixtrure of IPs and IP Ranges
		 * @param   boolean      paused               Is it paused?
		 * @param   integer      priority             What is the priority, default: none
		 * @return  stdClass                          CF response to request
		 */
		public function create ( $desc, $urls, $config, $paused, $priority = null ) {
			$endpoint = $this->getEndpoint ();
			$this->_requestModel->setType ( Request::REQUEST_POST );
			$this->_requestModel->setData ( array (
				"description" => $desc,
				"urls" => $urls,
				"configurations" => $config,
				"paused" => $paused,
				"priority" => $priority
			));
			return $this->_requestModel->resolve ( $endpoint );
		}

		/**
		 * This method takes in information about an already created zone
		 * lockdown and it updates it accordingly.
		 * using Cloudflare's API.
		 * @param   string       id                   Page rule ID
		 * @param   string       desc                 Zone lockdown description
		 * @param   array        urls                 Array of URLs to use
		 * @param   array        config               Mixtrure of IPs and IP Ranges
		 * @param   boolean      paused               Is it paused?
		 * @param   integer      priority             What is the priority, default: none
		 * @return  stdClass                          CF response to request
		 */
		public function edit ( $id, $desc, $urls, $config, $paused, $priority = null ) {
			$endpoint = $this->getEndpoint ( $this->_endpoint . "/$id" );
			$this->_requestModel->setType ( $this->_usePatchToSet ? Request::REQUEST_PATCH : Request::REQUEST_PUT );
			$this->_requestModel->setData ( array (
				"description" => $desc,
				"urls" => $urls,
				"configurations" => $config,
				"paused" => $paused,
				"priority" => $priority
			));
			return $this->_requestModel->resolve ( $endpoint );
		}

		/**
		 * This method takes in a zone lockdown rule id and it attempts to
		 * delete it using the Cloudflare API.
		 * @param   string       id                   Page rule ID
		 * @return  stdClass                          CF response to request
		 */
		public function delete ( $id ) {
			$endpoint = $this->getEndpoint ( $this->_endpoint . "/$id" );
			$this->_requestModel->setType ( Request::REQUEST_DELETE );
			return $this->_requestModel->resolve ( $endpoint );
		}

	}
