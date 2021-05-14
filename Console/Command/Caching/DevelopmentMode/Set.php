<?php

	namespace JetRails\Cloudflare\Console\Command\Caching\DevelopmentMode;

	use JetRails\Cloudflare\Console\Command\AbstractCommand;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Caching\DevelopmentMode;
	use Magento\Store\Model\StoreManagerInterface;
	use Symfony\Component\Console\Input\InputInterface;
	use Symfony\Component\Console\Input\InputOption;
	use Symfony\Component\Console\Output\OutputInterface;

	class Set extends AbstractCommand {

		protected $_storeManager;
		protected $_model;

		public function __construct (
			StoreManagerInterface $storeManager,
			DevelopmentMode $model
		) {
			// Call the parent constructor
			parent::__construct ( $storeManager );
			// Save injected classes internally
			$this->_storeManager = $storeManager;
			$this->_model = $model;
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
					"state",
					null,
					InputOption::VALUE_REQUIRED,
					"Set development-mode 'on' or 'off'?"
				)
			];
			$this
				->setName ("cloudflare:caching:development-mode:set")
				->setDescription ("Set development mode to 'on' or 'off'")
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
		public function runCommand ( InputInterface $input, OutputInterface $output ) {
			$domain = $input->getOption ("domain");
			$state = $input->getOption ("state");
			if ( !in_array ( $state, [ "on", "off" ] ) ) {
				$output->writeln ("Error: specify 'on' or 'off' for 'state' value");
				return $this;
			}
			$old = $this->_storeManager->getStore ()->getId ();
			$store = $this->_getStoreByDomain ( $domain );
			$this->_storeManager->setCurrentStore ( $store->getId () );
			$response = $this->_model->setValue ( $state === "on" );
			$this->_storeManager->setCurrentStore ( $old );
			if ( $this->_isSuccessful ( $response, $input, $output ) ) {
				$value = "<options=underscore>" . $response->result->value . "</>";
				$output->writeln ( "Development-Mode is set to: $value" );
			}
		}

	}
