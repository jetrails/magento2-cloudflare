<?php

	namespace JetRails\Cloudflare\Controller\Adminhtml;

	use Magento\Backend\App\Action\Context;
	use Magento\Backend\App\Action as CoreAction;
	use Magento\Framework\App\ObjectManager;
	use Magento\Framework\Json\Helper\Data as JsonData;
	use Magento\Framework\App\Request\Http;

	/**
	 * This is a generic controller that is used within other controller classes
	 * in this module. It supplies many helper methods that the child classes
	 * can use which simplify the code.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	abstract class Action extends CoreAction {

		protected $_jsonData;
		protected $_api;

		public function __construct (
			Context $context,
			Http $request,
			JsonData $jsonData,
			array $data = []
		) {
			parent::__construct ( $context, $data );
			$this->_jsonData = $jsonData;
			$resource = $request->getOriginalPathInfo ();
			$resource = preg_replace ( "/^.*\/cloudflare\/|\/.*$/", "", $resource );
			$resource = explode ( "_", $resource );
			$resource = array_map ( "ucfirst", $resource );
			$resource = implode ( "\\", $resource );
			$resource = "JetRails\\Cloudflare\\Model\\Adminhtml\\$resource";
			$objectManager = ObjectManager::getInstance ();
			$this->_api = $objectManager->create ( $resource );
		}

		/**
		 * This method uses the current controller name to determine the
		 * respective resource name that is used in the Magento ACL.
		 * @return  string                            ACL resource name
		 */
		protected function _getResourceName () {
			$resource = $this->getRequest ()->getControllerName ();
			$resource = preg_replace ( "/^cloudflare_/", "", $resource );
			$resource = str_replace ( "api_", "", $resource );
			$resource = str_replace ( "_", "/", $resource );
			$resource = preg_replace ( "/([A-Z])/", '_$1', $resource );
			return strtolower ( $resource );
		}

		/**
		 * This methods simply takes in a resource name and postfixes it to the
		 * jetrails/cloudflare resource path. It then returns whether or not the
		 * constructed resource path is authorized for the current user.
		 * @return  boolean                           Is resource accessible?
		 */
		protected function _isAllowed () {
			$resource = $this->_getResourceName ();
			$resource = preg_replace ( "/^.+\//m", "", $resource );
			return $this->_authorization
				->isAllowed ("JetRails_Cloudflare::$resource");
		}

		/**
		 * This method is used in every controller and it simply takes in an
		 * object and sends it back as a response. Optionally the caller can
		 * skip encoding the response to JSON, although by default it is.
		 * @param   object            response        The response to send back
		 * @param   boolean           encode          Should encode to JSON?
		 * @return  void
		 */
		protected function _sendResponse ( $response, $encode = true ) {
			$this->getResponse ()
				->clearHeaders ()
				->setHeader ( "content-type", "application/json" );
			$this->getResponse ()
				->setBody ( $encode ? $this->_jsonData->jsonEncode ( $response ) : $response );
		}

		/**
		 * This method is used to send back raw data as a response. This
		 * response is classified as a octet stream.
		 * @param   object            response        Response data
		 * @return  void
		 */
		protected function _sendRaw ( $response ) {
			$this->getResponse ()
				->clearHeaders ()
				->setHeader ( "content-type", "application/octet-stream" );
			$this->getResponse ()
				->setBody ( $response );
		}

	}
