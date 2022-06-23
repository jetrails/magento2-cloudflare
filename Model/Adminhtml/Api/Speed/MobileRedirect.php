<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api\Speed;

	use JetRails\Cloudflare\Model\Adminhtml\Api\Getter;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Overview\Configuration;
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
	class MobileRedirect extends Getter {

		/**
		 * @var     string      _endpoint             Appended to zone endpoint
		 */
		protected $_endpoint = "settings/mobile_redirect";
		protected $_requestModel;

		public function __construct (
			Configuration $configurationModel,
			Request $requestModel
		) {
			parent::__construct ( $configurationModel, $requestModel );
			$this->_requestModel = $requestModel;
		}

		/**
		 * This method simply constructs a GET request to the endpoint that is
		 * most appropriate based on how this object was configured.
		 * @return  stdClass                          CF response to request
		 */
		public function getValue () {
			$endpoint = $this->getEndpoint ();
			$this->_requestModel->setType ( Request::REQUEST_GET );
			$setting = $this->_requestModel->resolve ( $endpoint );
			if ( isset ( $setting->success ) && $setting->success ) {
				$endpoint = $this->getEndpoint ("dns_records");
				$this->_requestModel->setType ( Request::REQUEST_GET );
				$this->_requestModel->setQuery ( "per_page", 1000 );
				$this->_requestModel->setQuery ( "name", "starts_with:" );
				$this->_requestModel->setQuery ( "type", "A,AAAA,CNAME" );
				$domains = $this->_requestModel->resolve ( $endpoint );
				$setting->result->domains = array_map ( function ( $domain ) {
					preg_match ( "/^(.*)\..*?\..*$/m", $domain->name, $match );
					return array (
						"value" => count ( $match ) > 1 ? $match [ 1 ] : "",
						"label" => $domain->name . " (" . $domain->type . ")",
					);
				}, $domains->result );
			}
			return $setting;
		}

		/**
		 * This method takes in the options as arguments and transforms that
		 * into a valid request.
		 * @param   string      mobileSubdomain       Subdomain to use
		 * @param   string      status                Expecting 'on' or 'off'
		 * @param   boolean     stripUri              Drop path or keep it?
		 * @return  stdClass                          CF response to request
		 */
		public function change ( $mobileSubdomain, $status, $stripUri ) {
			$data = array (
				"mobile_subdomain" => $mobileSubdomain,
				"status" => $status,
				"strip_uri" => $stripUri
			);
			$endpoint = $this->getEndpoint ();
			$this->_requestModel->setType ( Request::REQUEST_PATCH );
			$this->_requestModel->setData ( array ( "value" => $data ) );
			$response = $this->_requestModel->resolve ( $endpoint );
			return $response;
		}

	}
