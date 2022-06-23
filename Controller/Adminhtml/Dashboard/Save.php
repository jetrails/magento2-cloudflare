<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml\Dashboard;

	use JetRails\Cloudflare\Helper\Adminhtml\Data as DataHelper;
	use Magento\Backend\App\Action\Context;
	use Magento\Backend\App\Action;

	/**
	 * This class extends from Magento's default controller action class and it
	 * is specific to the actions that can be used under the dashboard resource.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Save extends Action {

		protected $_dataHelper;

		public function __construct (
			Context $context,
			DataHelper $dataHelper,
			array $data = []
		) {
			parent::__construct ( $context, $data );
			$this->_dataHelper = $dataHelper;
		}

		/**
		 * This method simply authorizes access to the dashboard page based on
		 * the logged in user. The user must have resource access to the
		 * jetrails/cloudflare resource.
		 * @return  boolean                           Is access authorized?
		 */
		protected function _isAllowed () {
			return $this->_authorization
				->isAllowed ("JetRails_Cloudflare::configuration");
		}

		/**
		 * This action is used only by the overview/configuration section and
		 * therefore access to the resource is checked right away. It takes in
		 * an zone and a token and saves it with the use of the cloudflare/data
		 * helper class.
		 * @return  void
		 */
		public function execute () {
			$zone = $this->getRequest ()->getPost ("zone");
			$token = $this->getRequest ()->getPost ("token");
			$this->_dataHelper->setAuthZone ( $zone );
			$this->_dataHelper->setAuthToken ( $token );
			$this->_redirect ("*/*/view");
		}

	}
