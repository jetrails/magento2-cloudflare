<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api\Firewall;

	use JetRails\Cloudflare\Model\Adminhtml\Api\Overview\Configuration;
	use JetRails\Cloudflare\Model\Adminhtml\Api\PageGetter;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Request;

	/**
	 * This class inherits from the PageGetter class, so loading of the initial
	 * values gets processed through the parent class.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class UserAgentBlocking extends PageGetter {

		/**
		 * @var     string       _endpoint            Postfixed to zone endpoint
		 */
		protected $_endpoint = "firewall/ua_rules";
		protected $_requestModel;

		public function __construct (
			Configuration $configurationModel,
			Request $requestModel
		) {
			parent::__construct ( $configurationModel, $requestModel );
			$this->_requestModel = $requestModel;
		}

		/**
		 * This method wraps the PageGetter class and adds the results of the
		 * usage endpoint.
		 * @param   integer      page                Current page number to get
		 * @param   array        previous            Collection of prev results
		 * @return  stdClass                         CF response to request
		 */
		public function getValue ( $page = 1, $previous = array () ) {
			$result = parent::getValue ( $page, $previous );
			$result->usage = $this->usage ();
			return $result;
		}

		/**
		 * This method takes in a user agent blocking id and attempts to delete
		 * it using the Cloudflare API.
		 * @param   string       id                  User agent blocking id
		 * @return  stdClass                         CF response to request
		 */
		public function delete ( $id ) {
			$endpoint = $this->getEndpoint ("firewall/ua_rules/$id");
			$this->_requestModel->setType ( Request::REQUEST_DELETE );
			return $this->_requestModel->resolve ( $endpoint );
		}

		/**
		 * This method takes in all necessary information to update a user agent
		 * blocking rule and it sends it to the Cloudflare API.
		 * @param   string       id                  User agent blocking id
		 * @param   boolean      mode                Which mode does rule use
		 * @param   boolean      paused              Should the rule be paused?
		 * @param   string       value               The value of the user agent
		 * @param   string       description         The description for rule
		 * @return  stdClass                         CF response to request
		 */
		public function update ( $id, $mode, $paused, $value, $description ) {
			$endpoint = $this->getEndpoint ("firewall/ua_rules/$id");
			$this->_requestModel->setType ( Request::REQUEST_PUT );
			$this->_requestModel->setData ( array (
				"configuration" => array (
					"target" => "ua",
					"value" => $value
				),
				"id" => $id,
				"mode" => $mode,
				"paused" => $paused,
				"description" => $description
			));
			return $this->_requestModel->resolve ( $endpoint );
		}

		/**
		 * This method takes in all necessary information to create a user agent
		 * blocking rule and it sends it to the Cloudflare API.
		 * @param   boolean      mode                Which mode does rule use
		 * @param   boolean      paused              Should the rule be paused?
		 * @param   string       value               The value of the user agent
		 * @param   string       description         The description for rule
		 * @return  stdClass                         CF response to request
		 */
		public function create ( $mode, $paused, $value, $description ) {
			$endpoint = $this->getEndpoint ();
			$this->_requestModel->setType ( Request::REQUEST_POST );
			$this->_requestModel->setData ( array (
				"configuration" => array (
					"target" => "ua",
					"value" => $value
				),
				"mode" => $mode,
				"paused" => $paused,
				"description" => $description
			));
			return $this->_requestModel->resolve ( $endpoint );
		}

		/**
		 * This method asks the Cloudflare API for the usage information as it
		 * pertains to user agent rules. It then only returns the allocation for
		 * the zone scope.
		 * @return  stdClass                         CF response to request
		 */
		public function usage () {
			$endpoint = $this->getEndpoint ("firewall/ua_rules/usage");
			$this->_requestModel->setType ( Request::REQUEST_GET );
			$result = $this->_requestModel->resolve ( $endpoint );
			if ( isset ( $result->result ) ) {
				$result = array_filter ( $result->result, function ( $i ) {
					return $i->scope === "zone";
				});
				return $result [ 0 ];
			}
			return [
				"used" => 0,
				"max" => 0
			];
		}

	}
