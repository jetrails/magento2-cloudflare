<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml\Dashboard;

	use Magento\Backend\App\Action\Context;
	use Magento\Backend\App\Action;
	use Magento\Framework\View\Result\PageFactory;

	/**
	 * This class extends from Magento's default controller action class and it
	 * is specific to the actions that can be used under the dashboard resource.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class View extends Action {

		protected $_resultPageFactory;

		public function __construct (
			Context $context,
			PageFactory $resultPageFactory,
			array $data = []
		) {
			parent::__construct ( $context, $data );
			$this->_resultPageFactory = $resultPageFactory;
		}

		/**
		 * This method simply authorizes access to the dashboard page based on
		 * the logged in user. The user must have resource access to the
		 * jetrails/cloudflare resource.
		 * @return  boolean                           Is access authorized?
		 */
		protected function _isAllowed () {
			return $this->_authorization
				->isAllowed ("JetRails_Cloudflare::cloudflare");
		}

		/**
		 * This controller is used to render the dashboard template with the index
		 * action. It also has a save action that is used to update the Cloudflare
		 * zone and token that is used for API access. Finally it contains an
		 * action to change the domain to use with the Cloudflare dashboard. This
		 * domain selection is saved within the user's session.
		 * @return  object                            Return reference to self
		 */
		public function execute () {
			return $this->_resultPageFactory->create ();
		}

	}
