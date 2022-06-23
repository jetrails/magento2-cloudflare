<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml\Dashboard;

	use JetRails\Cloudflare\Helper\Adminhtml\Data as DataHelper;
	use Magento\Backend\App\Action\Context;
	use Magento\Backend\App\Action;
	use Magento\Framework\Session\SessionManagerInterface;

	/**
	 * This class extends from Magento's default controller action class and it
	 * is specific to the actions that can be used under the dashboard resource.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Domain extends Action {

		protected $_coreSession;
		protected $_dataHelper;

		public function __construct (
			Context $context,
			SessionManagerInterface $coreSession,
			DataHelper $dataHelper,
			array $data = []
		) {
			parent::__construct ( $context, $data );
			$this->_coreSession = $coreSession;
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
				->isAllowed ("JetRails_Cloudflare::cloudflare");
		}

		/**
		 * This action is simply used to change the scope of the dashboard by
		 * changing which domain we want to use with the Cloudflare dashboard.
		 * This change is saved within the logged in user's session and the zone
		 * id will be loaded using this selected domain name.
		 * @return  void
		 */
		public function execute () {
			$session = $this->_coreSession;
			$session->start ();
			$selected = $this->getRequest ()->getParam ("name");
			$domains = $this->_dataHelper->getDomainNames ();
			$domains = array_filter ( $domains, function ( $domain ) use ( $selected ) {
				return $domain ["name"] == $selected;
			});
			if ( count ( $domains ) === 1 ) {
				$session->setCloudflareSelectedDomain ( $selected );
			}
			$this->_redirect ("*/*/view");
		}

	}
