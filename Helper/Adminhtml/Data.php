<?php

	namespace JetRails\Cloudflare\Helper\Adminhtml;

	use stdClass;
	use JetRails\Cloudflare\Helper\Adminhtml\PublicSuffixList;
	use Magento\Framework\App\Cache\TypeListInterface;
	use Magento\Framework\App\Cache\Type\Config as ConfigType;
	use Magento\Framework\App\Config\ScopeConfigInterface;
	use Magento\Framework\App\Config\Storage\WriterInterface;
	use Magento\Framework\App\Helper\AbstractHelper;
	use Magento\Framework\App\Helper\Context;
	use Magento\Framework\Encryption\EncryptorInterface;
	use Magento\Framework\Session\SessionManagerInterface;
	use Magento\Framework\UrlInterface;
	use Magento\Store\Model\ScopeInterface;
	use Magento\Store\Model\StoreManagerInterface;

	/**
	 * This class is a helper class and it primarily deals with getting and
	 * setting the authentication zone and token that is used to access the
	 * Cloudflare API. It also deals with loading all the domain names that are
	 * found within this Magento installation and which domain is currently
	 * selected.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Data extends AbstractHelper {

		const XPATH_AUTH_ZONE  = "cloudflare/configuration/auth_zone";
		const XPATH_AUTH_TOKEN = "cloudflare/configuration/auth_token";

		protected $_cacheTypeList;
		protected $_configReader;
		protected $_configWriter;
		protected $_encryptor;
		protected $_coreSession;
		protected $_storeManager;
		protected $_urlBuilder;
		protected $_publicSuffixList;
		protected $_psl;

		public function __construct (
			Context $context,
			TypeListInterface $cacheTypeList,
			EncryptorInterface $encryptor,
			SessionManagerInterface $coreSession,
			ScopeConfigInterface $configReader,
			StoreManagerInterface $storeManager,
			WriterInterface $configWriter,
			UrlInterface $urlBuilder,
			PublicSuffixList $publicSuffixList,
			array $data = []
		) {
			parent::__construct ( $context, $data );
			$this->_cacheTypeList = $cacheTypeList;
			$this->_encryptor = $encryptor;
			$this->_configReader = $configReader;
			$this->_configWriter = $configWriter;
			$this->_coreSession = $coreSession;
			$this->_storeManager = $storeManager;
			$this->_urlBuilder = $urlBuilder;
			$this->_publicSuffixList = $publicSuffixList;
			$this->refreshPSL ();
		}

		public function refreshPSL () {
			$data = $this->_coreSession->getPSL ();
			if ( $data == null ) {
				$data = array_values ( $this->_publicSuffixList->getPSL () );
				$this->_coreSession->setPSL ( $data );
			}
			$this->_psl = $data;
			return $this->_psl;
		}

		/**
		 * This method gets the value for the authorization zone and decrypts
		 * it. It then returns that result to the caller.
		 * @return  string                            CF Authorization zone
		 */
		public function getAuthZone () {
			$zone = $this->_configReader->getValue (
				self::XPATH_AUTH_ZONE,
				ScopeInterface::SCOPE_STORE
			);
			$zones = $this->_encryptor->decrypt ( $zone );
			$zones = json_decode ( $zones );
			$domain = $this->getDomainName ();
			$isObject = $zones instanceof stdClass;
			$hasProp = $zones && property_exists ( $zones, "$domain" );
			return $isObject && $hasProp ? $zones->$domain : null;
		}

		/**
		 * This method gets the value for the authorization token and decrypts
		 * it. It then returns that result to the caller.
		 * @return  string                            CF Authorization token
		 */
		public function getAuthToken () {
			$token = $this->_configReader->getValue (
				self::XPATH_AUTH_TOKEN,
				ScopeInterface::SCOPE_STORE
			);
			$tokens = $this->_encryptor->decrypt ( $token );
			$tokens = json_decode ( $tokens );
			$domain = $this->getDomainName ();
			$isObject = $tokens instanceof stdClass;
			$hasProp = $tokens && property_exists ( $tokens, "$domain" );
			return $isObject && $hasProp ? $tokens->$domain : null;
		}

		/**
		 * This method takes in a new zone, saves that zone internally, and
		 * that zone is then used for CF authentication.
		 * @param   string       zone                Set CF auth zone to this
		 * @param   string       domain              Domain name
		 */
		public function setAuthZone ( $zone, $domain = false ) {
			$old = $this->_configReader->getValue (
				self::XPATH_AUTH_ZONE,
				ScopeInterface::SCOPE_STORE
			);
			$old = $this->_encryptor->decrypt ( $old );
			$old = json_decode ( $old );
			if ( !( $old instanceof stdClass ) ) $old = new stdClass ();
			if ( !$domain ) $domain = $this->getDomainName ();
			$zone = trim ( strval ( $zone ) );
			$old->$domain = $zone;
			$old = json_encode ( $old );
			$old = $this->_encryptor->encrypt ( $old );
			$this->_configWriter->save ( self::XPATH_AUTH_ZONE, $old );
			$this->_cacheTypeList->cleanType ( ConfigType::TYPE_IDENTIFIER );
		}

		/**
		 * This method takes in a new zone, saves that token internally, and
		 * that token is then used for CF authentication.
		 * @param   string       token                Set CF auth token to this
		 * @param   string       domain               Domain name
		 */
		public function setAuthToken ( $token, $domain = false ) {
			$old = $this->_configReader->getValue (
				self::XPATH_AUTH_TOKEN,
				ScopeInterface::SCOPE_STORE
			);
			$old = $this->_encryptor->decrypt ( $old );
			$old = json_decode ( $old );
			if ( !( $old instanceof stdClass ) ) $old = new stdClass ();
			if ( !$domain ) $domain = $this->getDomainName ();
			$token = trim ( strval ( $token ) );
			$old->$domain = $token;
			$old = json_encode ( $old );
			$old = $this->_encryptor->encrypt ( $old );
			$this->_configWriter->save ( self::XPATH_AUTH_TOKEN, $old );
			$this->_cacheTypeList->cleanType ( ConfigType::TYPE_IDENTIFIER );
		}

		/**
		 * This method returns the currently selected domain name. If there is
		 * no domain name that is selected, then the main website's domain name
		 * is extracted from the store's base URL.
		 * @return  string                            Currently selected domain
		 */
		public function getDomainName () {
			$session = $this->_coreSession;
			$session->start ();
			if ( !empty ( $session->getCloudflareSelectedDomain () ) ) {
				return $session->getCloudflareSelectedDomain ();
			}
			$domain = $this->_storeManager->getStore ()->getBaseUrl ();
			return $this->_publicSuffixList->extract ( $domain, $this->_psl ) ["root_domain"];
		}

		/**
		 * This method looks though all the stores that are setup in Magento. It
		 * then extracts the domain name from the store's base URL. It then
		 * returns an array of objects that contain the domain name, the url for
		 * changing the selected domain to said domain, and whether the domain
		 * is currently selected.
		 * @return  array                             All domains for all stores
		 */
		public function getDomainNames () {
			$selection = $this->getDomainName ();
			$domains = array ();
			$stores = $this->_storeManager->getStores ();
			foreach ( $stores as $store ) {
				$domain = $this->_publicSuffixList->extract ( $store->getBaseUrl (), $this->_psl ) ["root_domain"];
				array_push ( $domains, $domain );
			}
			$domains = array_unique ( $domains );
			sort ( $domains );
			$domains = array_map ( function ( $domain ) use ( $selection ) {
				return array (
					"name" => $domain,
					"active" => $domain == $selection,
					"action" => $this->_urlBuilder->getUrl (
						"*/*/domain",
						array ( "name" => $domain )
					)
				);
			}, $domains );
			return $domains;
		}

	}
