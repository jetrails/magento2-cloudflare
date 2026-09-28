<?php

	namespace JetRails\Cloudflare\Model\Adminhtml\Api\Firewall;

	use JetRails\Cloudflare\Model\Adminhtml\Api\Getter;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Overview\Configuration;
	use JetRails\Cloudflare\Model\Adminhtml\Api\Request;

	/**
	 * Custom rules replace the deprecated firewall rules and filters APIs. They
	 * live as rules inside of the zone's entry point ruleset for the
	 * http_request_firewall_custom phase. The order of the rules within that
	 * ruleset is the order that they get evaluated in.
	 * @version     1.4.6
	 * @package     JetRails® Cloudflare
	 * @author      Rafael Grigorian <development@jetrails.com>
	 * @copyright   © 2018 JETRAILS, All rights reserved
	 * @license     MIT https://opensource.org/licenses/MIT
	 */
	class CustomRules extends Getter {

		/**
		 * @var     string       _endpoint            Postfixed to zone endpoint
		 * @var     array        _limits              Custom rules allowed per plan
		 * @var     array        _readOnly            Rule fields CF generates
		 */
		protected $_endpoint = "rulesets/phases/http_request_firewall_custom/entrypoint";
		protected $_limits = array (
			"free" => 5,
			"pro" => 20,
			"business" => 100,
			"enterprise" => 1000
		);
		protected $_readOnly = array ( "id", "version", "last_updated" );
		protected $_requestModel;

		public function __construct (
			Configuration $configurationModel,
			Request $requestModel
		) {
			parent::__construct ( $configurationModel, $requestModel );
			$this->_requestModel = $requestModel;
		}

		/**
		 * This method asks the Cloudflare API for the entry point ruleset. The
		 * request model is shared, so any payload from a previous request is
		 * cleared first.
		 * @return  stdClass                         CF response to request
		 */
		protected function _getEntrypoint () {
			$this->_requestModel->setType ( Request::REQUEST_GET );
			$this->_requestModel->setData ( false );
			return $this->_requestModel->resolve ( $this->getEndpoint () );
		}

		/**
		 * Zones that never had a custom rule do not have an entry point ruleset
		 * and Cloudflare responds with error code 10003 in that case.
		 * @param   stdClass     response            CF response to request
		 * @return  boolean                          Entry point is missing?
		 */
		protected function _isMissing ( $response ) {
			if ( !is_object ( $response ) || !empty ( $response->success ) ) {
				return false;
			}
			$errors = isset ( $response->errors ) ? $response->errors : array ();
			foreach ( $errors as $error ) {
				if ( isset ( $error->code ) && intval ( $error->code ) === 10003 ) {
					return true;
				}
			}
			return false;
		}

		/**
		 * This method builds a response similar to what Cloudflare returns in
		 * the case that a response was not successful.
		 * @param   string       message             Error message to display
		 * @return  stdClass                         CF like response
		 */
		protected function _error ( $message ) {
			return ( object ) array (
				"success" => false,
				"errors" => array ( ( object ) array ( "code" => 404, "message" => $message ) ),
				"messages" => array (),
				"result" => null
			);
		}

		/**
		 * This method loads the entry point ruleset and finds the rule that
		 * corresponds to the passed id. The returned rule is a copy that has
		 * its read only fields removed, so it can be sent back to Cloudflare.
		 * @param   string       id                  Custom rule id
		 * @return  array                            [ response, ruleset, rule ]
		 */
		protected function _findRule ( $id ) {
			$response = $this->_getEntrypoint ();
			if ( $this->_isMissing ( $response ) ) {
				return array ( $this->_error ("Custom rule not found"), null, null );
			}
			if ( !is_object ( $response ) || empty ( $response->success ) ) {
				return array ( $response, null, null );
			}
			$rules = isset ( $response->result->rules ) ? $response->result->rules : array ();
			foreach ( $rules as $rule ) {
				if ( $rule->id === $id ) {
					$rule = clone $rule;
					foreach ( $this->_readOnly as $field ) unset ( $rule->$field );
					return array ( $response, $response->result->id, $rule );
				}
			}
			return array ( $this->_error ("Custom rule not found"), null, null );
		}

		/**
		 * This method takes in the values from the dashboard and builds the
		 * rule definition that Cloudflare expects. Skip options are only used
		 * by the skip action and the custom response is only used by the block
		 * action.
		 * @param   string        name               Rule description
		 * @param   string        expression         Rule expression
		 * @param   string        action             Rule action
		 * @param   boolean       enabled            Is the rule enabled?
		 * @param   array         skip               ruleset, phases, products
		 * @param   array         response           content_type, status_code, content
		 * @param   boolean       logging            Log requests matching skip?
		 * @return  array                            Rule to send to CF
		 */
		protected function _buildRule ( $name, $expression, $action, $enabled, $skip, $response, $logging ) {
			$rule = array (
				"description" => $name,
				"expression" => $expression,
				"action" => $action,
				"enabled" => $enabled
			);
			if ( $action === "skip" ) {
				$parameters = array ();
				if ( $skip ["ruleset"] ) $parameters ["ruleset"] = "current";
				if ( count ( $skip ["phases"] ) > 0 ) $parameters ["phases"] = array_values ( $skip ["phases"] );
				if ( count ( $skip ["products"] ) > 0 ) $parameters ["products"] = array_values ( $skip ["products"] );
				$rule ["action_parameters"] = ( object ) $parameters;
				$rule ["logging"] = array ( "enabled" => $logging );
			}
			else if ( $action === "block" && $response ["content_type"] !== "" ) {
				$rule ["action_parameters"] = array ( "response" => $response );
			}
			return $rule;
		}

		/**
		 * This method takes in a position and a target rule id and converts it
		 * into a position object that Cloudflare understands. An empty rule id
		 * for before and after means first and last respectively.
		 * @param   string        position           first, last, before, after
		 * @param   string        target             Rule id to place next to
		 * @return  mixed                            CF position or null
		 */
		protected function _buildPosition ( $position, $target ) {
			switch ( $position ) {
				case "first": return array ( "before" => "" );
				case "last": return array ( "after" => "" );
				case "before":
				case "after":
					return $target !== "" ? array ( $position => $target ) : null;
				default: return null;
			}
		}

		/**
		 * This method returns the endpoint for the rules within a ruleset, or
		 * a single rule if an id is passed.
		 * @param   string       rulesetId           Entry point ruleset id
		 * @param   string       id                  Custom rule id
		 * @return  string                           Resulting endpoint
		 */
		protected function _getRuleEndpoint ( $rulesetId, $id = false ) {
			$endpoint = sprintf ( "rulesets/%s/rules", rawurlencode ( $rulesetId ) );
			if ( $id !== false ) $endpoint .= "/" . rawurlencode ( $id );
			return $this->getEndpoint ( $endpoint );
		}

		/**
		 * This method gets the entry point ruleset and attaches usage details
		 * to it. If the entry point ruleset does not exist yet, then an empty
		 * ruleset is returned.
		 * @return  stdClass                         CF response to request
		 */
		public function getValue () {
			$response = $this->_getEntrypoint ();
			if ( $this->_isMissing ( $response ) ) {
				$response = ( object ) array (
					"success" => true,
					"errors" => array (),
					"messages" => array (),
					"result" => ( object ) array ( "id" => null, "rules" => array () )
				);
			}
			if ( is_object ( $response ) && isset ( $response->result ) && is_object ( $response->result ) ) {
				if ( !isset ( $response->result->rules ) ) {
					$response->result->rules = array ();
				}
				$response->usage = $this->usage ( count ( $response->result->rules ) );
			}
			return $response;
		}

		/**
		 * This method asks the Cloudflare API for the zone details and it uses
		 * the zone's plan to determine how many custom rules are allowed.
		 * @param   integer      used                Number of existing rules
		 * @return  array                            Used and max rules
		 */
		public function usage ( $used ) {
			$this->_requestModel->setType ( Request::REQUEST_GET );
			$this->_requestModel->setData ( false );
			$zoneId = $this->_configurationModel->getZoneId ();
			$zone = $this->_requestModel->resolve ( "zones/$zoneId" );
			$plan = isset ( $zone->result->plan->legacy_id ) ? $zone->result->plan->legacy_id : "";
			return array (
				"used" => $used,
				"max" => isset ( $this->_limits [ $plan ] ) ? $this->_limits [ $plan ] : null,
				"plan" => $plan
			);
		}

		/**
		 * This method creates a custom rule. If the entry point ruleset does
		 * not exist yet, then it is created with the new rule inside of it.
		 * @param   string        name               Rule description
		 * @param   string        expression         Rule expression
		 * @param   string        action             Rule action
		 * @param   boolean       enabled            Is the rule enabled?
		 * @param   array         skip               ruleset, phases, products
		 * @param   array         response           content_type, status_code, content
		 * @param   boolean       logging            Log requests matching skip?
		 * @param   string        position           first, last, before, after
		 * @param   string        target             Rule id to place next to
		 * @return  stdClass                         CF response to request
		 */
		public function create ( $name, $expression, $action, $enabled, $skip, $response, $logging, $position, $target ) {
			$payload = $this->_buildRule ( $name, $expression, $action, $enabled, $skip, $response, $logging );
			$entrypoint = $this->_getEntrypoint ();
			if ( $this->_isMissing ( $entrypoint ) ) {
				$this->_requestModel->setType ( Request::REQUEST_PUT );
				$this->_requestModel->setData ( array ( "rules" => array ( $payload ) ) );
				return $this->_requestModel->resolve ( $this->getEndpoint () );
			}
			if ( !is_object ( $entrypoint ) || empty ( $entrypoint->success ) ) {
				return $entrypoint;
			}
			$position = $this->_buildPosition ( $position, $target );
			if ( $position !== null ) $payload ["position"] = $position;
			$this->_requestModel->setType ( Request::REQUEST_POST );
			$this->_requestModel->setData ( $payload );
			return $this->_requestModel->resolve ( $this->_getRuleEndpoint ( $entrypoint->result->id ) );
		}

		/**
		 * This method updates a custom rule. Fields that the dashboard does not
		 * manage are kept from the existing rule so they are not lost.
		 * @param   string        id                 Custom rule id
		 * @param   string        name               Rule description
		 * @param   string        expression         Rule expression
		 * @param   string        action             Rule action
		 * @param   boolean       enabled            Is the rule enabled?
		 * @param   array         skip               ruleset, phases, products
		 * @param   array         response           content_type, status_code, content
		 * @param   boolean       logging            Log requests matching skip?
		 * @param   string        position           first, last, before, after
		 * @param   string        target             Rule id to place next to
		 * @return  stdClass                         CF response to request
		 */
		public function update ( $id, $name, $expression, $action, $enabled, $skip, $response, $logging, $position, $target ) {
			list ( $result, $rulesetId, $existing ) = $this->_findRule ( $id );
			if ( $existing === null ) return $result;
			unset ( $existing->action_parameters );
			unset ( $existing->logging );
			$rule = $this->_buildRule ( $name, $expression, $action, $enabled, $skip, $response, $logging );
			foreach ( $rule as $key => $value ) {
				$existing->$key = $value;
			}
			$position = $this->_buildPosition ( $position, $target );
			if ( $position !== null ) $existing->position = $position;
			$this->_requestModel->setType ( Request::REQUEST_PATCH );
			$this->_requestModel->setData ( $existing );
			return $this->_requestModel->resolve ( $this->_getRuleEndpoint ( $rulesetId, $id ) );
		}

		/**
		 * This method enables or disables a custom rule while leaving the rest
		 * of its definition untouched.
		 * @param   string       id                  Custom rule id
		 * @param   boolean      enabled             Should the rule be enabled?
		 * @return  stdClass                         CF response to request
		 */
		public function toggle ( $id, $enabled ) {
			list ( $response, $rulesetId, $existing ) = $this->_findRule ( $id );
			if ( $existing === null ) return $response;
			$existing->enabled = $enabled;
			$this->_requestModel->setType ( Request::REQUEST_PATCH );
			$this->_requestModel->setData ( $existing );
			return $this->_requestModel->resolve ( $this->_getRuleEndpoint ( $rulesetId, $id ) );
		}

		/**
		 * This method moves a custom rule without changing its definition.
		 * @param   string        id                 Custom rule id
		 * @param   string        position           first, last, before, after
		 * @param   string        target             Rule id to place next to
		 * @return  stdClass                         CF response to request
		 */
		public function position ( $id, $position, $target ) {
			$position = $this->_buildPosition ( $position, $target );
			if ( $position === null ) return $this->_error ("Invalid rule position");
			$entrypoint = $this->_getEntrypoint ();
			if ( !is_object ( $entrypoint ) || empty ( $entrypoint->success ) ) {
				return $entrypoint;
			}
			$this->_requestModel->setType ( Request::REQUEST_PATCH );
			$this->_requestModel->setData ( array ( "position" => $position ) );
			return $this->_requestModel->resolve ( $this->_getRuleEndpoint ( $entrypoint->result->id, $id ) );
		}

		/**
		 * This method takes in a custom rule id and asks the Cloudflare API to
		 * delete the rule that corresponds to that id.
		 * @param   string       id                  Custom rule id
		 * @return  stdClass                         CF response to request
		 */
		public function delete ( $id ) {
			$entrypoint = $this->_getEntrypoint ();
			if ( !is_object ( $entrypoint ) || empty ( $entrypoint->success ) ) {
				return $entrypoint;
			}
			$this->_requestModel->setType ( Request::REQUEST_DELETE );
			$this->_requestModel->setData ( false );
			return $this->_requestModel->resolve ( $this->_getRuleEndpoint ( $entrypoint->result->id, $id ) );
		}

	}
