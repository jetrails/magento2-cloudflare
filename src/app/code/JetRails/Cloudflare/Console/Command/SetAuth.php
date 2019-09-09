<?php

	namespace JetRails\Cloudflare\Console\Command;

	use JetRails\Cloudflare\Helper\Adminhtml\Data;
	use Magento\Framework\App\Cache\TypeListInterface;
	use Symfony\Component\Console\Command\Command;
	use Symfony\Component\Console\Input\InputInterface;
	use Symfony\Component\Console\Input\InputOption;
	use Symfony\Component\Console\Output\OutputInterface;

	class SetAuth extends Command {

		/**
		 * These internal data members include instances of helper classes that are injected into
		 * the class using dependency injection on runtime.  Also a boolean variable is included
		 * that defines if the action should be run if the feature is disabled in the store config.
		 * @var         TypeListInterface   _cacheTypeList      Instance of the TypeListInterface class
		 * @var         Data                _data               Instance of the Data class
		 * @var         Logger              _logger             Instance of the Logger class
		 * @var         Purger              _purger             Instance of the Purger class
		 * @var         Boolean             _runIfDisabled      Execute method if feature isn't on?
		 */
		protected $_cacheTypeList;
		protected $_data;

		/**
		 * This constructor is overloaded from the parent class in order to use dependency injection
		 * to get the dependency classes that we need for this module's command actions to execute.
		 * @param       Data                data                Instance of the Data class
		 * @param       TypeListInterface   cacheTypeList       Instance of the TypeListInterface class
		 */
		public function __construct (
			Data $data,
			TypeListInterface $cacheTypeList
		) {
			// Call the parent constructor
			parent::__construct ();
			// Save injected classes internally
			$this->_cacheTypeList = $cacheTypeList;
			$this->_data = $data;
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
			$domains = array_map ( function ( $entry ) {
				return $entry ["name"];
			}, $this->_data->getDomainNames () );
			if ( !in_array ( $domain, $domains ) ) {
				$output->writeln ("Error: invalid domain name, available options are:");
				$output->writeln ("");
				foreach ( $domains as $d) {
					$output->writeln ("- $d");
				}
				$output->writeln ("");
				return $this;
			}
			$this->_data->setAuthZone ( $zone, $domain );
			$this->_data->setAuthToken ( $token, $domain );
			$output->writeln ("Successfully saved zone and token for domain $domain.");
		}

	}
