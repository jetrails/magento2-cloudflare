<?php

	namespace JetRails\Cloudflare\Block\Adminhtml;

	use JetRails\Cloudflare\Helper\Adminhtml\Data;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Overview\Configuration;
	use Magento\Framework\View\Element\Template;
	use Magento\Framework\View\Element\Template\Context;
	use Magento\Framework\View\LayoutInterface;
	use Magento\Store\Model\StoreManagerInterface;

	/**
	 * This block class is binded to the dashboard template. It contains helper
	 * methods that load and render tab contents. It also contains methods that
	 * help determine if the current store is configured with the supplied
	 * Cloudflare account.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Dashboard extends Template {

		protected $_dataHelper;
		protected $_layout;
		protected $_storeManager;
		protected $_configurationModel;

		public function __construct (
			Context $context,
			Configuration $configurationModel,
			Data $dataHelper,
			LayoutInterface $layout,
			StoreManagerInterface $storeManager,
			array $data = []
		) {
			parent::__construct ( $context, $data );
			$this->_configurationModel = $configurationModel;
			$this->_dataHelper = $dataHelper;
			$this->_layout = $layout;
			$this->_storeManager = $storeManager;
		}

		/**
		 * This method takes in a tab name and loads that tab's template binded
		 * to the tab block. The HTML is then returned to the caller.
		 * @param   string            name            Name of tab to load
		 * @return  string                            Loaded tab HTML
		 */
		public function getTabContent ( $name ) {
			return $this->_layout
				->createBlock ("JetRails\Cloudflare\Block\Adminhtml\Dashboard\Tab")
				->setTemplate ("JetRails_Cloudflare::$name.phtml")
				->toHtml ();
		}

		/**
		 * This method uses this module's helper class to return the current
		 * store's domain name.
		 * @return  string                            Domain name of store
		 */
		public function getDomainName () {
			$domain = $this->_dataHelper->getDomainName ();
			return $domain;
		}

		/**
		 * This method uses this module's helper class to return all the domains
		 * that are contained within this Magento installation.
		 * @return  array                             All store domains
		 */
		public function getDomainNames () {
			$domains = $this->_dataHelper->getDomainNames ();
			return $domains;
		}

		/**
		 * This method simply asks the store manager to get the current store's
		 * base URL.
		 * @return  string                            Base URL of store
		 */
		public function getBaseUrl () {
			return $this->_storeManager->getStore ()->getBaseUrl ();
		}

		/**
		 * This method uses the overview/configuration model to determine
		 * whether the API credentials that are saved internally are valid.
		 * @return  boolean                           Are API credentials valid?
		 */
		public function isValidAuth () {
			return $this->_configurationModel->validateAuth ();
		}

		/**
		 * This method uses the overview/configuration model to determine
		 * whether or not the current store's domain is configured within
		 * Cloudflare and whether or not there is a zone associated with that
		 * domain.
		 * @return  boolean                           Zone exists for domain?
		 */
		public function isValidZone () {
			$zoneId = $this->_configurationModel->getZoneId ();
			return $this->isValidAuth () && !empty ( $zoneId );
		}

	}
