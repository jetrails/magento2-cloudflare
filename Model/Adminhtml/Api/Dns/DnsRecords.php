<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api\Dns;

	use CurlFile;
	use JetRails\Cloudflare\Helper\Adminhtml\Data as DataHelper;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Overview\Configuration;
	use JetRails\Cloudflare\Model\Adminhtml\Api\PageGetter;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Request;

	/**
	 * This class inherits from the PageGetter class, so loading of the initial
	 * values gets processed through the parent class.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class DnsRecords extends PageGetter {

		/**
		 * @var     string       _endpoint            Postfixed to zone endpoint
		 */
		protected $_endpoint = "dns_records";
		protected $_requestModel;
		protected $_dataHelper;

		public function __construct (
			Configuration $configurationModel,
			DataHelper $dataHelper,
			Request $requestModel
		) {
			parent::__construct ( $configurationModel, $requestModel );
			$this->_dataHelper = $dataHelper;
			$this->_requestModel = $requestModel;
		}

		/**
		 * This method asks the Cloudflare to export all DNS records and return
		 * a BIND configuration file.
		 * @return  stdClass                         CF response to request
		 */
		public function export () {
			$endpoint = $this->getEndpoint ("dns_records/export");
			$this->_requestModel->setType ( Request::REQUEST_GET );
			return $this->_requestModel->resolve ( $endpoint, false );
		}

		/**
		 * This method takes in a file object that is uploaded to the server and
		 * it sends it to the Cloudflare API. This configuration file is used to
		 * import all the DNS records that are contained within it.
		 * @param   array        file                Uploaded file assoc array
		 * @return  stdClass                         CF response to request
		 */
		public function import ( $file ) {
			$endpoint = $this->getEndpoint ("dns_records/import");
			$this->_requestModel->setHeader ( "Content-Type", "multipart/form-data" );
			$this->_requestModel->setType ( Request::REQUEST_POST );
			$this->_requestModel->setData ( array (
				"file" => new CurlFile (
					$file ["tmp_name"],
					"text/plain",
					$file ["name"]
				)
			));
			return $this->_requestModel->resolve ( $endpoint, false );
		}

		/**
		 * This method takes in a DNS record id and asks the Cloudflare API to
		 * delete said record with the corresponding id.
		 * @param   string       id                  The DNS record ID
		 * @return  stdClass                         CF response to request
		 */
		public function deleteRecord ( $id ) {
			$endpoint = $this->getEndpoint ("dns_records/$id");
			$this->_requestModel->setType ( Request::REQUEST_DELETE );
			return $this->_requestModel->resolve ( $endpoint );
		}

		/**
		 * This method takes in all values that are necessary to edit a DNS
		 * record. It then sends the request to the Cloudflare API.
		 * @param   string       id                  DNS record id
		 * @param   string       type                The type of DNS record
		 * @param   string       name                The name value for record
		 * @param   string       content             The content for record
		 * @param   integer      ttl                 The TTL value in seconds
		 * @param   boolean      proxied             Is the record proxied?
		 * @param   integer      priority            What is the priority value
		 * @return  stdClass                         CF response to request
		 */
		public function editRecord (
			$id,
			$type,
			$name,
			$content,
			$ttl,
			$proxied = null,
			$priority = 1
		) {
			$reSRVName = "/^([^.]+)\.([^.]+)\.(.+)\.$/";
			$reSRVValue = "/^SRV ([^ ]+) ([^ ]+) ([^ ]+) (.+)\.$/";
			$reCAA = "/^0 ((?:issue|issuewild|iodef)) \"(.+)\"$/";
			$reLOC = "/^IN LOC ([^ ]+) ([^ ]+) ([^ ]+) ([NS]) ([^ ]+) ([^ ]+)" .
			" ([^ ]+) ([WE]) ([^ ]+)m ([^ ]+)m ([^ ]+)m ([^ ]+)m$/";
			if ( $name == "@" ) {
				$name = $this->_dataHelper->getDomainName ();
			}
			$data = array (
				"type" => $type,
				"name" => $name,
				"content" => $content,
				"ttl" => $ttl,
				"priority" => $priority,
				"proxied" => $proxied
			);
			if ( in_array ( $type, array ( "A", "AAAA", "CNAME" ) ) ) {
				$data ["proxied"] = $proxied;
			}
			else if ( $type == "MX" ) {
				$data ["priority"] = $priority;
			}
			else if ( $type == "LOC" && preg_match($reLOC,$content,$matches) ) {
				$data ["data"] = array (
					"lat_degrees" => intval ( $matches [ 1 ] ),
					"lat_minutes" => intval ( $matches [ 2 ] ),
					"lat_seconds" => floatval ( $matches [ 3 ] ),
					"lat_direction" => $matches [ 4 ],
					"long_degrees" => intval ( $matches [ 5 ] ),
					"long_minutes" => intval ( $matches [ 6 ] ),
					"long_seconds" => floatval ( $matches [ 7 ] ),
					"long_direction" => $matches [ 8 ],
					"altitude" => intval ( $matches [ 9 ] ),
					"size" => intval ( $matches [ 10 ] ),
					"precision_horz" => intval ( $matches [ 11 ] ),
					"precision_vert" => intval ( $matches [ 12 ] )
				);
				$data ["priority"] = 1;
				$data ["proxied"] = false;
			}
			else if ( $type == "SRV" &&
					  preg_match ( $reSRVName, $name, $matchesName ) &&
					  preg_match ( $reSRVValue, $content, $matchesContent ) ) {
				$domain = $this->_dataHelper->getDomainName ();
				if ( $matchesName [ 3 ] == "@" ) {
					$matchesName [ 3 ] = $domain;
				}
				if ( $matchesContent [ 4 ] == "@" ) {
					$matchesContent [ 4 ] = $domain;
				}
				$data ["data"] = array (
					"name" => $matchesName [ 3 ],
					"priority" => $matchesContent [ 1 ],
					"proto" => $matchesName [ 2 ],
					"weight" => $matchesContent [ 2 ],
					"port" => $matchesContent [ 3 ],
					"target" => $matchesContent [ 4 ],
					"service" => $matchesName [ 1 ]
				);
				$data ["priority"] = 1;
				$data ["proxied"] = false;
			}
			else if ( $type == "CAA" && preg_match($reCAA,$content,$matches) ) {
				$data ["data"] = array (
					"tag" => $matches [ 1 ],
					"value" => $matches [ 2 ],
					"flags" => 0
				);
				$data ["priority"] = 1;
				$data ["proxied"] = false;
			}
			$endpoint = $this->getEndpoint ("dns_records/$id");
			$this->_requestModel->setType ( Request::REQUEST_PUT );
			$this->_requestModel->setData ( $data );
			return $this->_requestModel->resolve ( $endpoint );
		}

		/**
		 * This method takes in all values that are necessary to create a DNS
		 * record. It then sends the request to the Cloudflare API.
		 * @param   string       type                The type of DNS record
		 * @param   string       name                The name value for record
		 * @param   string       content             The content for record
		 * @param   integer      ttl                 The TTL value in seconds
		 * @param   boolean      proxied             Is the record proxied?
		 * @param   integer      priority            What is the priority value
		 * @return  stdClass                         CF response to request
		 */
		public function createRecord (
			$type,
			$name,
			$content,
			$ttl,
			$proxied = null,
			$priority = 1
		) {
			$reSRVName = "/^([^.]+)\.([^.]+)\.(.+)\.$/";
			$reSRVValue = "/^SRV ([^ ]+) ([^ ]+) ([^ ]+) (.+)\.$/";
			$reCAA = "/^0 ((?:issue|issuewild|iodef)) \"(.+)\"$/";
			$reLOC = "/^IN LOC ([^ ]+) ([^ ]+) ([^ ]+) ([NS]) ([^ ]+) ([^ ]+)" .
					 " ([^ ]+) ([WE]) ([^ ]+)m ([^ ]+)m ([^ ]+)m ([^ ]+)m$/";
			if ( $name == "@" ) {
				$name = $this->_dataHelper->getDomainName ();
			}
			$data = array (
				"type" => $type,
				"name" => $name,
				"content" => $content,
				"ttl" => $ttl,
				"priority" => $priority
			);
			if ( in_array ( $type, array ( "A", "AAAA", "CNAME" ) ) ) {
				$data ["proxied"] = $proxied;
			}
			else if ( $type == "MX" ) {
				$data ["priority"] = $priority;
			}
			else if ( $type == "LOC" && preg_match($reLOC,$content,$matches) ) {
				$data ["data"] = array (
					"lat_degrees" => intval ( $matches [ 1 ] ),
					"lat_minutes" => intval ( $matches [ 2 ] ),
					"lat_seconds" => doubleval ( $matches [ 3 ] ),
					"lat_direction" => $matches [ 4 ],
					"long_degrees" => intval ( $matches [ 5 ] ),
					"long_minutes" => intval ( $matches [ 6 ] ),
					"long_seconds" => doubleval ( $matches [ 7 ] ),
					"long_direction" => $matches [ 8 ],
					"altitude" => intval ( $matches [ 9 ] ),
					"size" => intval ( $matches [ 10 ] ),
					"precision_horz" => intval ( $matches [ 11 ] ),
					"precision_vert" => intval ( $matches [ 12 ] )
				);
				$data ["priority"] = 1;
				$data ["proxied"] = false;
			}
			else if ( $type == "SRV" &&
					  preg_match ( $reSRVName, $name, $matchesName ) &&
					  preg_match ( $reSRVValue, $content, $matchesContent ) ) {
				$domain = $this->_dataHelper->getDomainName ();
				if ( $matchesName [ 3 ] == "@" ) {
					$matchesName [ 3 ] = $domain;
				}
				if ( $matchesContent [ 4 ] == "@" ) {
					$matchesContent [ 4 ] = $domain;
				}
				$data ["data"] = array (
					"name" => $matchesName [ 3 ],
					"priority" => $matchesContent [ 1 ],
					"proto" => $matchesName [ 2 ],
					"weight" => $matchesContent [ 2 ],
					"port" => $matchesContent [ 3 ],
					"target" => $matchesContent [ 4 ],
					"service" => $matchesName [ 1 ]
				);
				$data ["priority"] = 1;
				$data ["proxied"] = false;
			}
			else if ( $type == "CAA" && preg_match($reCAA,$content,$matches) ) {
				$data ["data"] = array (
					"tag" => $matches [ 1 ],
					"value" => $matches [ 2 ],
					"flags" => 0
				);
				$data ["priority"] = 1;
				$data ["proxied"] = false;
			}
			$endpoint = $this->getEndpoint ();
			$this->_requestModel->setType ( Request::REQUEST_POST );
			$this->_requestModel->setData ( $data );
			return $this->_requestModel->resolve ( $endpoint );
		}

	}
