<?php

	namespace JetRails\Cloudflare\Console\Command\Caching\PurgeCache;

	use JetRails\Cloudflare\Console\Command\AbstractCommand;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Caching\PurgeCache;
	use Magento\Store\Model\StoreManagerInterface;
	use Symfony\Component\Console\Input\InputInterface;
	use Symfony\Component\Console\Input\InputOption;
	use Symfony\Component\Console\Output\OutputInterface;

	class Url extends AbstractCommand {

		protected $_storeManager;
		protected $_model;

		public function __construct (
			StoreManagerInterface $storeManager,
			PurgeCache $model
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
					"url",
					null,
					InputOption::VALUE_REQUIRED | InputOption::VALUE_IS_ARRAY,
					"URL to purge from cache"
				)
			];
			$this
				->setName ("cloudflare:caching:purge-cache:url")
				->setDescription ("Purge URLs from Cloudflare cache")
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
			$old = $this->_storeManager->getStore ()->getId ();
			$domain = $input->getOption ("domain");
			$urls = $input->getOption ("url");
			$store = $this->_getStoreByDomain ( $domain );
			$this->_storeManager->setCurrentStore ( $store->getId () );
			$response = $this->_model->purgeUrls ( $urls );
			$this->_storeManager->setCurrentStore ( $old );
			if ( $this->_isSuccessful ( $response, $input, $output ) ) {
				$output->writeln ("Successfully purged urls!");
			}
		}

	}
