<?php

	namespace JetRails\Cloudflare\Helper\Adminhtml;

	use Magento\Framework\App\Helper\AbstractHelper;

	/**
	 * This helper exists to download a list of domain suffixes that are used to then determine the
	 * effective TLD and the root domain of a hostname.
	 * @version     1.4.0
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class PublicSuffixList extends AbstractHelper {

		protected function _endsWith ( $haystack, $needle ) {
			$length = strlen ( $needle );
			return $length > 0 ? substr ( $haystack, - $length ) === $needle : true;
		}

		public function getPSL () {
			$handle = curl_init ();
			curl_setopt ( $handle, CURLOPT_URL, "https://publicsuffix.org/list/public_suffix_list.dat" );
			curl_setopt ( $handle, CURLOPT_RETURNTRANSFER, 1 );
			curl_setopt ( $handle, CURLOPT_TIMEOUT, 3 );
			$output = curl_exec ( $handle );
			$code = curl_getinfo ( $handle, CURLINFO_HTTP_CODE );
			curl_close ( $handle );
			if ( $code == 200 ) {
				$lines = explode ( "\n", $output );
				$lines = array_filter ( $lines, function ( $line ) { return $line != "" && !in_array ( $line [0], [ "/", " ", "\t" ] ); } );
				$lines = array_map ( function ( $line ) { return trim ( $line, ".!* \t" ); }, $lines );
				return $lines;
			}
			return [];
		}

		public function extract ( $url, $suffixes = null ) {
			$host_name = parse_url ( $url ) ["host"];
			$max_segments = null;
			$best_match = null;
			if ( $suffixes == null ) {
				$suffixes = $this->getPSL ();
			}
			foreach ( $suffixes as $suffix ) {
				if ( $this->_endsWith ( $host_name, ".$suffix" ) ) {
					$count = substr_count ( $suffix, "." );
					if ( $max_segments == null || $count > $max_segments ) {
						$max_segments = $count;
						$best_match = $suffix;
					}
				}
			}
			$root_domain = implode ( ".", array_slice ( explode ( ".", $host_name ), -1 * ( $max_segments + 2 ) ) );
			return [
				"host_name" => $host_name,
				"root_domain" => $root_domain,
				"effective_tld" => $best_match ? $best_match : "",
			];
		}

	}