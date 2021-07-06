<?php

	namespace JetRails\Cloudflare\Console\Command;

	use stdClass;
	use JetRails\Cloudflare\Helper\Adminhtml\PublicSuffixList;
	use Magento\Framework\App\Cache\Type\Config as ConfigType;
	use Magento\Framework\App\Cache\TypeListInterface;
	use Magento\Framework\App\Config\ScopeConfigInterface;
	use Magento\Framework\App\Config\Storage\WriterInterface;
	use Magento\Framework\Encryption\EncryptorInterface;
	use Magento\Store\Model\ScopeInterface;
	use Magento\Store\Model\StoreManagerInterface;
	use Symfony\Component\Console\Command\Command;
	use Symfony\Component\Console\Input\InputInterface;
	use Symfony\Component\Console\Input\InputOption;
	use Symfony\Component\Console\Output\OutputInterface;

	class SetAuth extends Command {

		/**
		 * @var     string       XPATH_AUTH_ZONE      Path to auth zone setting
		 * @var     string       XPATH_AUTH_TOKEN     Path to auth token setting
		 */
		const XPATH_AUTH_ZONE  = "cloudflare/configuration/auth_zone";
		const XPATH_AUTH_TOKEN = "cloudflare/configuration/auth_token";

		protected $_cacheTypeList;
		protected $_configReader;
		protected $_configWriter;
		protected $_encryptor;
		protected $_storeManager;
		protected $_publicSuffixList;
		protected $_psl;

		public function __construct (
			StoreManagerInterface $storeManager,
			TypeListInterface $cacheTypeList,
			EncryptorInterface $encryptor,
			ScopeConfigInterface $configReader,
			WriterInterface $configWriter,
			PublicSuffixList $publicSuffixList
		) {
			// Call the parent constructor
			parent::__construct ();
			// Save injected classes internally
			$this->_storeManager = $storeManager;
			$this->_cacheTypeList = $cacheTypeList;
			$this->_configReader = $configReader;
			$this->_configWriter = $configWriter;
			$this->_encryptor = $encryptor;
			$this->_publicSuffixList = $publicSuffixList;
		}

		/**
		 * Inside we set the command name and set the command description.
		 * @return      void
		 */
		protected function configure () {
			// Register the command and set the arguments
			$options = [
				new InputOption (
					"domain",
					null,
					InputOption::VALUE_REQUIRED,
					"What is the domain name?"
				),
				new InputOption (
					"zone",
					null,
					InputOption::VALUE_REQUIRED,
					"What is the Cloudflare Zone ID?"
				),
				new InputOption (
					"token",
					null,
					InputOption::VALUE_REQUIRED,
					"What is the Cloudflare API token?"
				)
			];
			$this
				->setName ("cloudflare:set-auth")
				->setDescription ("Save Cloudflare zone-id/api-token for given domain name")
				->setDefinition ( $options );
			parent::configure ();
		}

		/**
		 * This method looks though all the stores that are setup in Magento. It
		 * then extracts the domain name from the store's base URL.
		 * @return  array                             All domains for all stores
		 */
		private function _getDomainNames () {
			if ( $this->_psl == null ) {
				$this->_psl = $this->_publicSuffixList->getPSL ();
			}
			$domains = array ();
			$stores = $this->_storeManager->getStores ();
			foreach ( $stores as $store ) {
				$domain = $this->_publicSuffixList->extract ( $store->getBaseUrl (), $this->_psl ) ["root_domain"];
				array_push ( $domains, $domain );
			}
			$domains = array_unique ( $domains );
			sort ( $domains );
			return $domains;
		}

		/**
		 * This method takes in a new zone, saves that zone internally, and
		 * that zone is then used for CF authentication.
		 * @param   string       zone                Set CF auth zone to this
		 * @param   string       domain              Domain name
		 */
		private function _setAuthZone ( $zone, $domain ) {
			$old = $this->_configReader->getValue (
				self::XPATH_AUTH_ZONE,
				ScopeInterface::SCOPE_STORE
			);
			$old = $this->_encryptor->decrypt ( $old );
			$old = json_decode ( $old );
			if ( !( $old instanceof stdClass ) ) $old = new stdClass ();
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
		private function _setAuthToken ( $token, $domain ) {
			$old = $this->_configReader->getValue (
				self::XPATH_AUTH_TOKEN,
				ScopeInterface::SCOPE_STORE
			);
			$old = $this->_encryptor->decrypt ( $old );
			$old = json_decode ( $old );
			if ( !( $old instanceof stdClass ) ) $old = new stdClass ();
			$token = trim ( strval ( $token ) );
			$old->$domain = $token;
			$old = json_encode ( $old );
			$old = $this->_encryptor->encrypt ( $old );
			$this->_configWriter->save ( self::XPATH_AUTH_TOKEN, $old );
			$this->_cacheTypeList->cleanType ( ConfigType::TYPE_IDENTIFIER );
		}

		/**
		 * This method is here because it interfaces with the abstract parent class.  It takes in an
		 * input and output interface and it runs the command.
		 * @param       InputInterface      input               The input interface
		 * @param       OutputInterface     output              The output interface
		 * @return      void
		 */
		public function execute ( InputInterface $input, OutputInterface $output ) {
			$domain = $input->getOption ("domain");
			$zone = $input->getOption ("zone");
			$token = $input->getOption ("token");
			if ( !$domain ) {
				$output->writeln ("Error: please pass domain name with --domain option.");
				return $this;
			}
			if ( !$zone ) {
				$output->writeln ("Error: please pass zone name with --zone option.");
				return $this;
			}
			if ( !$token ) {
				$output->writeln ("Error: please pass token name with --token option.");
				return $this;
			}
			$domains = $this->_getDomainNames ();
			if ( !in_array ( $domain, $domains ) ) {
				$output->writeln ("Error: invalid domain name, available options are:");
				$output->writeln ("");
				foreach ( $domains as $d) {
					$output->writeln ("- $d");
				}
				$output->writeln ("");
				return $this;
			}
			$this->_setAuthZone ( $zone, $domain );
			$this->_setAuthToken ( $token, $domain );
			$output->writeln ("Successfully saved zone and token for domain $domain.");
		}

	}
