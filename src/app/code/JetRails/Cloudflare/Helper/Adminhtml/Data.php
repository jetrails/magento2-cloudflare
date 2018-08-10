<?php

	namespace JetRails\Cloudflare\Helper\Adminhtml;

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
	 * setting the authentication email and token that is used to access the
	 * Cloudflare API. It also deals with loading all the domain names that are
	 * found within this Magento installation and which domain is currently
	 * selected.
	 * @version     1.0.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Data extends AbstractHelper {

		/**
		 * @var     string       XPATH_AUTH_EMAIL     Path to auth email setting
		 * @var     string       XPATH_AUTH_TOKEN     Path to auth token setting
		 */
		const XPATH_AUTH_EMAIL = "cloudflare/configuration/auth_email";
		const XPATH_AUTH_TOKEN = "cloudflare/configuration/auth_token";

		protected $_cacheTypeList;
		protected $_configReader;
		protected $_configWriter;
		protected $_encryptor;
		protected $_coreSession;
		protected $_storeManager;
		protected $_urlBuilder;

		public function __construct (
			Context $context,
			TypeListInterface $cacheTypeList,
			EncryptorInterface $encryptor,
			SessionManagerInterface $coreSession,
			ScopeConfigInterface $configReader,
			StoreManagerInterface $storeManager,
			WriterInterface $configWriter,
			UrlInterface $urlBuilder,
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
		}

		/**
		 * This method gets the value for the authorization email and decrypts
		 * it. It then returns that result to the caller.
		 * @return  string                            CF Authorization email
		 */
		public function getAuthEmail () {
			$email = $this->_configReader->getValue (
				self::XPATH_AUTH_EMAIL,
				ScopeInterface::SCOPE_STORE
			);
			return $this->_encryptor->decrypt ( $email );
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
			return $this->_encryptor->decrypt ( $token );
		}

		/**
		 * This method takes in a new email, saves that email internally, and
		 * that email is then used for CF authentication.
		 * @param   string       email                Set CF auth email to this
		 */
		public function setAuthEmail ( $email ) {
			$email = trim ( strval ( $email ) );
			$email = $this->_encryptor->encrypt ( $email );
			$this->_configWriter->save ( self::XPATH_AUTH_EMAIL, $email );
			$this->_cacheTypeList->cleanType ( ConfigType::TYPE_IDENTIFIER );
		}

		/**
		 * This method takes in a new email, saves that token internally, and
		 * that token is then used for CF authentication.
		 * @param   string       token                Set CF auth token to this
		 */
		public function setAuthToken ( $token ) {
			$token = trim ( strval ( $token ) );
			$token = $this->_encryptor->encrypt ( $token );
			$this->_configWriter->save ( self::XPATH_AUTH_TOKEN, $token );
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
			$domain = parse_url ( $domain ) ["host"];
			preg_match ( "/\.?([^.]+\.[^.]+)$/i", $domain, $matches );
			return $matches [ 1 ];
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
				$domain = parse_url ( $store->getBaseUrl () ) ["host"];
				array_push ( $domains, $domain );
			}
			$domains = array_unique ( $domains );
			sort ( $domains );
			$domains = array_map ( function ( $domain ) use ( $selection ) {
				preg_match ( "/\.?([^.]+\.[^.]+)$/i", $domain, $matches );
				$domain = $matches [ 1 ];
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
