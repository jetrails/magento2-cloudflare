<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api;

	use JetRails\Cloudflare\Model\Adminhtml\Api\Getter;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Overview\Configuration;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Request;

	/**
	 * This class is very similar to the Getter class, the only difference is
	 * that it attempts to load all the records across all the pages of records
	 * that Cloudflare has. Once all the records have been accumulated, then the
	 * full set is returned to the caller.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class PageGetter extends Getter {

		protected $_requestModel;

		public function __construct (
			Configuration $configurationModel,
			Request $requestModel
		) {
			parent::__construct ( $configurationModel, $requestModel );
			$this->_requestModel = $requestModel;
		}

		/**
		 * This method takes in a page number and an array of results that gets
		 * accumulated. Once all records throughout all pages are loaded, then
		 * the accumulated results are returned.
		 * @param   integer      page                Current page number to get
		 * @param   array        previous            Collection of prev results
		 * @return  stdClass                         CF response to request
		 */
		public function getValue ( $page = 1, $previous = array () ) {
			$endpoint = $this->getEndpoint ();
			$this->_requestModel->setType ( Request::REQUEST_GET );
			$this->_requestModel->setQuery ( "page", intval ( $page ) );
			$result = $this->_requestModel->resolve ( $endpoint );
			if ( property_exists ( $result, "result_info" ) &&
				 property_exists ( $result->result_info, "per_page" ) &&
				 property_exists ( $result->result_info, "total_count" ) ) {
				$total = $result->result_info->total_count;
				$per_page = $result->result_info->per_page;
				if ( $page < ceil ( $total / $per_page ) ) {
					$previous = array_merge ( $previous, $result->result );
					return $this->getValue ( $page + 1, $previous );
				}
				else {
					$data = $result->result;
					$result->result = array_merge ( $previous, $data );
				}
			}
			return $result;
		}

	}
