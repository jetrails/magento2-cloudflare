<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api\Overview;

	use JetRails\Cloudflare\Helper\Adminhtml\Data;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Request;
	use Magento\Framework\Session\SessionManagerInterface;

	/**
	 * This class handles the logic to authenticate an email/token pair through
	 * the use of the Cloudflare API. It also has a very popular method that
	 * retrieves the currently selected domain's zone id.
	 * @version     1.0.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Configuration {

		protected $_session;
		protected $_request;
		protected $_data;

		public function __construct (
			Data $data,
			Request $request,
			SessionManagerInterface $session
		) {
			$this->_data = $data;
			$this->_request = $request;
			$this->_session = $session;
		}

		/**
		 * This method caches a zone value based on a passed domain. This is
		 * used cache the result of an API call within an entire session. The
		 * zone id is cached, because it gets used a lot throughout a typical
		 * session.
		 * @param   string       domain               Domain to cache as key
		 * @param   string       zone                 The zone to cache as value
		 * @return  void
		 */
		protected function _setCached ( $domain, $zone ) {
			$lookup = array ();
			if ( !empty ( $this->_session->getDomainZone () ) ) {
				$lookup = $this->_session->getDomainZone ();
			}
			$lookup [ "$domain" ] = "$zone";
			$this->_session->setDomainZone ( $lookup );
		}

		/**
		 * This method attempts to retrieve a zone id from cache, based on a
		 * domain name. If there is no zone id for the passed domain name, then
		 * false is returned.
		 * @param   string       domain               Domain for zone id
		 * @return  mixed                             Cached zone id or false
		 */
		protected function _getCached ( $domain ) {
			$lookup = $this->_session->getDomainZone ();
			if ( !empty ( $lookup ) &&
				 is_array ( $lookup ) &&
				 array_key_exists ( "$domain", $lookup )
			 ) {
				return $lookup ["$domain"];
			}
			return false;
		}

		/**
		 * This method takes in an email and a token. It then makes an API call
		 * to Cloudflare and finds out if the supplied email and token is valid.
		 * @param   string       email               CF authentication email
		 * @param   string       token               CF authentication token
		 * @return  boolean                          Is user authenticated?
		 */
		public function validateAuth ( $email = null, $token = null ) {
			$this->_request->setType ( Request::REQUEST_GET );
			if ( !empty ( $email ) && !empty ( $token ) ) {
				$this->_request->setAuth ( $email, $token );
			}
			$response = $this->_request->resolve ("zones");
			return $response->success;
		}

		/**
		 * This method is public facing and is used to return the zone id of the
		 * currently selected domain. We cache the domain and zone id pair
		 * internally because this method is used a lot throughout the module.
		 * @return  mixed                            Zone id or null if invalid
		 */
		public function getZoneId () {
			$domain = $this->_data->getDomainName ();
			$cached = $this->_getCached ("$domain");
			if ( $cached !== false ) {
				return $cached;
			}
			$this->_request->setType ( Request::REQUEST_GET );
			$this->_request->setQuery ( "name", $domain );
			$response = $this->_request->resolve ("zones");
			 if ( $response->success && count ( $response->result ) > 0 ) {
				$this->_setCached ( "$domain", $response->result [ 0 ]->id );
				return $response->result [ 0 ]->id;
			}
			return null;
		}

	}
