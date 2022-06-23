<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api\Dns;

	use stdClass;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Getter;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Request;

	/**
	 * This class is a parent class that child classes inherit from. It
	 * implements functionality to easily get a setting value from Cloudflare
	 * using their API.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class CustomNameservers extends Getter {

		/**
		 * @var     string      _endpoint       Appended to zone endpoint
		 */
		protected $_endpoint = "";

		/**
		 * This method simply constructs a GET request to the endpoint that is
		 * most appropriate based on how this object was configured.
		 * @return  stdClass                          CF response to request
		 */
		public function getValue () {
			$endpoint = $this->getEndpoint ();
			$this->_requestModel->setType ( Request::REQUEST_GET );
			$response = $this->_requestModel->resolve ( $endpoint );
			if ( $response->success ) {
				$response->result = true
					&& property_exists ( $response->result, "vanity_name_servers_ips" )
					&& $response->result->vanity_name_servers_ips
					? $response->result->vanity_name_servers_ips
					: new stdClass ();
			}
			return $response;
		}

		/**
		 * This method takes in a list of custom nameservers and it updates it
		 * accordingly using Cloudflare's API.
		 * @param   array        records              List of custom nameservers
		 * @return  stdClass                          CF response to request
		 */
		public function edit ( $records ) {
			$endpoint = $this->getEndpoint ();
			$this->_requestModel->setType ( Request::REQUEST_PATCH );
			$this->_requestModel->setData ( array ( "vanity_name_servers" => $records ));
			$response = $this->_requestModel->resolve ( $endpoint );
			if ( $response->success ) {
				$response->result = $response->result->vanity_name_servers_ips
					? $response->result->vanity_name_servers_ips
					: new stdClass ();
			}
			return $response;
		}

	}
