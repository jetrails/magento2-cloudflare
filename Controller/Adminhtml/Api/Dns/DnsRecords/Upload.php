<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml\Api\Dns\DnsRecords;

	use JetRails\Cloudflare\Controller\Adminhtml\Action;

	/**
	 * This controller inherits from a generic controller that implements the
	 * base functionality for interfacing with a getter model. This action
	 * simply loads the initial value through the Cloudflare API. The rest of
	 * this class extends on that functionality and adds more endpoints.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class Upload extends Action {

		/**
		 * This action takes in the uploaded bind config file and asks the
		 * Cloudflare API model to parse the file and add the DNS records that
		 * are contained within it.
		 * @return  void
		 */
		public function execute () {
			$uploader = $this->_objectManager->create (
				"Magento\MediaStorage\Model\File\Uploader",
				[ "fileId" => "file" ]
			);
			$file = $uploader->validateFile ();
			if ( file_exists ( $file ["tmp_name"] ) ) {
				$response = $this->_api->import ( $file );
				return $this->_sendResponse ( $response, false );
			}
			else {
				return $this->_sendResponse ( array ( "success" => false ) );
			}
		}

	}
