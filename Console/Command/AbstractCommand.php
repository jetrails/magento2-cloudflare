<?php

	namespace JetRails\Cloudflare\Console\Command;

	use Magento\Store\Model\StoreManagerInterface;
	use Symfony\Component\Console\Command\Command;
	use Symfony\Component\Console\Input\InputInterface;
	use Symfony\Component\Console\Output\OutputInterface;

	abstract class AbstractCommand extends Command {

		protected $_storeManager;

		public function __construct (
			StoreManagerInterface $storeManager
		) {
			// Call the parent constructor
			parent::__construct ();
			// Save injected classes internally
			$this->_storeManager = $storeManager;
		}

		/**
		 * This method looks though all the stores that are setup in Magento. It
		 * then extracts the domain name from the store's base URL.
		 * @return  array                             All domains for all stores
		 */
		protected function _getDomainNames () {
			$domains = array ();
			$stores = $this->_storeManager->getStores ();
			foreach ( $stores as $store ) {
				$domain = parse_url ( $store->getBaseUrl () ) ["host"];
				preg_match ( "/([^.\s]+\.([^.\s]{3,}|[^.\s]{2}\.[^.\s]{2}|[^.\s]{2}))\b$/im", $domain, $matches );
				array_push ( $domains, $matches [ 1 ] );
			}
			$domains = array_unique ( $domains );
			sort ( $domains );
			return $domains;
		}

		/**
		 * This method looks though all the stores that are setup in Magento. It
		 * then returns the store object that matches the domain name.
		 * @param   string       domain               Domain name
		 * @return  array|false                       All domains for all stores
		 */
		protected function _getStoreByDomain ( $domain ) {
			$stores = $this->_storeManager->getStores ();
			foreach ( $stores as $store ) {
				$host = parse_url ( $store->getBaseUrl () ) ["host"];
				preg_match ( "/([^.\s]+\.([^.\s]{3,}|[^.\s]{2}\.[^.\s]{2}|[^.\s]{2}))\b$/im", $host, $matches );
				if ( $matches [ 1 ] === $domain ) {
					return $store;
				}
			}
			return false;
		}

		/**
		 * This method is used to handle error messages and failed requests.
		 * @param       Object              response            Response from cloudflare
		 * @param       InputInterface      input               The input interface
		 * @param       OutputInterface     output              The output interface
		 * @return      bool                                    Was request successful?
		 */
		protected function _isSuccessful ( $response, $input, $output ) {
			if ( property_exists ( $response, "success" ) ) {
				if ( property_exists ( $response, "errors" ) ) {
					foreach ( $response->errors as $error ) {
						$output->writeln ("Error [$error->code]: $error->message");
					}
				}
				return $response->success;
			}
			else if ( property_exists ( $response, "error" ) ) {
				$output->writeln ("Error [$response->code]: $response->error");
			}
			return false;
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
			if ( !$domain ) {
				$output->writeln ("Error: please pass domain name with --domain option.");
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
			$this->runCommand ( $input, $output );
		}

		protected abstract function runCommand (
			InputInterface $input,
			OutputInterface $output
		);

	}
