<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api;

	use JetRails\Cloudflare\Helper\Adminhtml\Data as DataHelper;

	/**
	 * This class is used for all the Cloudflare API models. It is used to
	 * construct the request and gather information within the instance. Once
	 * all the data is collected and saved within the instance, this class has
	 * a method to transform all the collected data into a CURL request and
	 * executes it.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Request {

		/**
		 * This class constant defines the API endpoint to Cloudflare's API. It
		 * is used as a base to append to and modify the endpoint.
		 */
		const CLOUDFLARE_API_ENDPOINT = "https://api.cloudflare.com/client/v4";

		/**
		 * These class constants define which kind of request must be created.
		 * The request type is saved within the _type data member. These
		 * constants work as a stand in for an enum type.
		 */
		const REQUEST_GET = "GET";
		const REQUEST_DELETE = "DELETE";
		const REQUEST_PUT = "PUT";
		const REQUEST_POST = "POST";
		const REQUEST_PATCH = "PATCH";

		/**
		 * @var     integer      _type                The type of request
		 * @var     array        _headers             Array defining header vals
		 * @var     stdClass     _data                Data to send as a payload
		 * @var     array        _query               GET data appended to URL
		 */
		protected $_type;
		protected $_headers;
		protected $_data;
		protected $_query;
		protected $_dataHelper;

		public function __construct ( DataHelper $dataHelper ) {
			$this->_dataHelper = $dataHelper;
			$this->_construct ();
		}

		/**
		 * This constructor simply sets everything up by initializing all the
		 * class data members and setting the authentication headers. These
		 * values are found using the data helper class.
		 */
		public function _construct () {
			$this->_headers = false;
			$this->_data = false;
			$this->_query = false;
			$token = $this->_dataHelper->getAuthToken ();
			$this->setType ( self::REQUEST_GET );
			$this->setHeader ( "Authorization", "Bearer " . $token );
			$this->setHeader ( "Content-Type", "application/json" );
		}

		/**
		 * This method constructs the endpoint given a target to append to the
		 * base API URL. It also builds a GET request that is appended to the
		 * endpoint and it contains data that is stored in the _query variable.
		 * @var     string       target               Postfix to base endpoint
		 * @return  string                            Constructed endpoint URL
		 */
		protected function _getEndpoint ( $target ) {
			$url = self::CLOUDFLARE_API_ENDPOINT . "/" . $target;
			if ( $this->_query !== false ) {
				$url .= "?" . http_build_query ( $this->_query );
			}
			return $url;
		}

		/**
		 * This Method simply modifies the two header values that the Cloudflare
		 * API uses for authentication. The two parameters are used as the
		 * values.
		 * @param   string       zone                 CF authentication zone
		 * @param   string       token                CF authentication token
		 * @return  void
		 */
		public function setAuth ( $token ) {
			$this->setHeader ( "Authorization", "Bearer $token" );
		}

		/**
		 * This method takes in a type (enum) and it saves the type based on the
		 * enum that is passed. Note that the reason for not simply setting the
		 * type directly is because we want to ensure the correct use for the
		 * type and also default to the GET request type if an invalid one is
		 * passed instead.
		 * @param   integer      type                 The request type to use
		 * @return  void
		 */
		public function setType ( $type ) {
			switch ( $type ) {
				case self::REQUEST_DELETE:
					$this->_type = self::REQUEST_DELETE;
					break;
				case self::REQUEST_PUT:
					$this->_type = self::REQUEST_PUT;
					break;
				case self::REQUEST_POST:
					$this->_type = self::REQUEST_POST;
					break;
				case self::REQUEST_PATCH:
					$this->_type = self::REQUEST_PATCH;
					break;
				default:
					$this->_type = self::REQUEST_GET;
					break;
			}
		}

		/**
		 * This method takes in a key and value string. It then uses these
		 * values to store them inside the _headers associative array. These
		 * values will later be mapped to "key: value" entries.
		 * @param   string       key                  The header entry name
		 * @param   string       value                The header entry value
		 * @return  void
		 */
		public function setHeader ( $key, $value ) {
			if ( $this->_headers === false ) $this->_headers = array ();
			$this->_headers [ strval ( $key ) ] = strval ( $value );
		}

		/**
		 * This method simply sets whatever is passed to the _data data member.
		 * It is important to note that the type for 'value' is an associative
		 * array or a stdClass.
		 * @param   mixed        value                Payload for CF API request
		 * @return  void
		 */
		public function setData ( $value ) {
			$this->_data = $value;
		}

		/**
		 * This method takes in a key value pair and it saves it internally
		 * within an associative array. These values are later transformed into
		 * a GET query that is appended to the endpoint.
		 * @param   string       key                  The attribute name
		 * @param   string       value                The attribute value
		 * @return  void
		 */
		public function setQuery ( $key, $value ) {
			if ( $this->_query === false ) $this->_query = array ();
			$this->_query [ strval ( $key ) ] = strval ( $value );
		}

		/**
		 * This method takes in an endpoint and it creates the request based on
		 * all the information that was collected. It makes the request and
		 * returns the result. By default, it decodes the response from the JSON
		 * string that the CF API response with.
		 * @param   string       endpoint             API endpoint to hit
		 * @param   boolean      decode               JSON decode on response?
		 * @return  mixed                             CF response to request
		 */
		public function resolve ( $endpoint, $decode = true ) {
			$endpoint = $this->_getEndpoint ($endpoint);
			$this->setAuth ( $this->_dataHelper->getAuthToken () ); // For CLI
			$handle = curl_init ();
			curl_setopt ( $handle, CURLOPT_URL, $endpoint );
			curl_setopt ( $handle, CURLOPT_RETURNTRANSFER, true );
			curl_setopt ( $handle, CURLOPT_SAFE_UPLOAD, true );
			curl_setopt ( $handle, CURLOPT_CUSTOMREQUEST, $this->_type );
			if ( $this->_headers !== false ) {
				$headers = array ();
				array_walk (
					$this->_headers,
					function ( $value, $key ) use ( &$headers ) {
						array_push ( $headers, $key . ": " . $value );
					}
				);
				curl_setopt ( $handle, CURLOPT_HTTPHEADER, $headers );
			}
			if ( $this->_data !== false ) {
				$post_data = $this->_data;
				if ( $this->_headers ["Content-Type"] == "application/json" ) {
					$post_data = json_encode ( $this->_data );
				}
				curl_setopt ( $handle, CURLOPT_POSTFIELDS, $post_data );
			}
			$result = curl_exec ( $handle );
			curl_close ( $handle );
			return $decode === true ? json_decode ( $result ) : $result;
		}

	}
