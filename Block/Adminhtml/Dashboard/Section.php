<?php

	namespace JetRails\Cloudflare\Block\Adminhtml\Dashboard;

	use JetRails\Cloudflare\Helper\Adminhtml\Data as DataHelper;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Overview\Configuration;
	use Magento\Framework\Data\Form\FormKey;
	use Magento\Framework\View\Element\Template;
	use Magento\Framework\View\Element\Template\Context;

	/**
	 * This block class is binded to every section template found in the design
	 * folder. This block class has methods that give the template access to a
	 * valid form key for AJAX communications. This block class also returns a
	 * custom endpoint for every section based on the binded template's path.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Section extends Template {

		protected $_formKey;
		protected $_urlBuilder;
		protected $_configurationModel;
		protected $_dataHelper;

		public function __construct (
			Context $context,
			Configuration $configurationModel,
			DataHelper $dataHelper,
			FormKey $formKey,
			array $data = []
		) {
			parent::__construct ( $context, $data );
			$this->_configurationModel = $configurationModel;
			$this->_dataHelper = $dataHelper;
			$this->_formKey = $formKey;
		}

		/**
		 * Uses core session model to return a valid form key. This form key is
		 * used to enable AJAX communications.
		 * @return  string                            Form key
		 */
		public function getFormKey () {
			return $this->_formKey->getFormKey ();
		}

		/**
		 * This method uses the data helper to get the currently saved
		 * authentication zone id. If non exists, then empty string is
		 * used.
		 * @return  string                            Returns saved auth zone
		 */
		public function getAuthZone () {
			$zone = $this->_dataHelper->getAuthZone ();
			return empty ( $zone ) ? "" : $zone;
		}

		/**
		 * This method looks at the currently saved zone id and token, it then
		 * attempts to authenticate these values and return the state of
		 * authentication in the form of a state string.
		 * @return  string                            Returns if auth is valid
		 */
		public function getValidationState () {
			$state = $this->_configurationModel->validateAuth ();
			return $state ? "Valid" : "Invalid";
		}

		/**
		 * This method uses the configuration model in order to attempt to get
		 * the zone id that is associated with the domain name that is currently
		 * being used for the current store view. If no zone id is present, then
		 * 'N/A' is returned.
		 * @return  string                            Zone id for current store
		 */
		public function getZoneId () {
			$zoneId = $this->_configurationModel->getZoneId ();
			return $zoneId === false ? "N/A" : $zoneId;
		}

		/**
		 * This method takes the template that is binded to this block and it
		 * uses the template name to generate a custom endpoint. This endpoint
		 * is used to enable AJAX communications with the template's
		 * respective controllers.
		 * @return  string                            URL to custom endpoint
		 */
		public function getApiEndpoint () {
			$route = $this->getTemplate ();
			$route = preg_replace ( "/^.*::|\.phtml$/", "", $route );
			$route = explode ( "/", $route );
			$route = array_map ( function ( $i ) {
				$i = explode ( "_", $i );
				$i = array_map ( "ucfirst", $i );
				$i [ 0 ] = strtolower ( $i [ 0 ] );
				$i = implode ( "", $i );
				return $i;
			}, $route );
			$route = implode ( "_", $route );
			return $this->getUrl ("cloudflare/api_$route");
		}

	}
