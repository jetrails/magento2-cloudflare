const $ = jQuery = jquery = require ("jquery")
const ui = require ("jquery-ui-dist/jquery-ui.js")
const notification = require ("cloudflare/core/notification")
const common = require ("cloudflare/common")
const global = require ("cloudflare/global")

require ("cloudflare/speed/automatic_platform_optimization")
require ("cloudflare/speed/image_resizing")
require ("cloudflare/speed/prefetch_urls")
require ("cloudflare/speed/amp_real_url")
require ("cloudflare/speed/auto_minify")
require ("cloudflare/speed/mirage")
require ("cloudflare/speed/mobile_redirect")
require ("cloudflare/speed/rocket_loader")
require ("cloudflare/speed/polish")
require ("cloudflare/speed/enhanced_http2_prioritization")
require ("cloudflare/speed/brotli")
require ("cloudflare/speed/tcp_turbo")
require ("cloudflare/speed/early_hints.js")
require ("cloudflare/page_rules/page_rules")
require ("cloudflare/network/websockets")
require ("cloudflare/network/maximum_upload_size")
require ("cloudflare/network/pseudo_ipv4")
require ("cloudflare/network/true_client_ip_header")
require ("cloudflare/network/response_buffering")
require ("cloudflare/network/http_2")
require ("cloudflare/network/ip_geolocation")
require ("cloudflare/network/onion_routing")
require ("cloudflare/network/http_3")
require ("cloudflare/network/ipv6_compatibility")
require ("cloudflare/network/zero_rtt_connection_resumption")
require ("cloudflare/network/grpc.js")
require ("cloudflare/network/http_2_to_origin.js")
require ("cloudflare/firewall/access_rules")
require ("cloudflare/firewall/bot_management")
require ("cloudflare/firewall/bot_fight_mode")
require ("cloudflare/firewall/challenge_passage")
require ("cloudflare/firewall/user_agent_blocking")
require ("cloudflare/firewall/web_application_firewall")
require ("cloudflare/firewall/security_level")
require ("cloudflare/firewall/zone_lockdown")
require ("cloudflare/firewall/javascript_detections")
require ("cloudflare/firewall/privacy_pass_support")
require ("cloudflare/firewall/browser_integrity_check")
require ("cloudflare/firewall/firewall_rules.js")
require ("cloudflare/ssl_tls/always_use_https")
require ("cloudflare/ssl_tls/minimum_tls_version")
require ("cloudflare/ssl_tls/authenticated_origin_pulls")
require ("cloudflare/ssl_tls/ssl_tls_recommender")
require ("cloudflare/ssl_tls/certificate_transparency_monitoring")
require ("cloudflare/ssl_tls/tls_13")
require ("cloudflare/ssl_tls/ssl")
require ("cloudflare/ssl_tls/opportunistic_encryption")
require ("cloudflare/ssl_tls/disable_universal_ssl")
require ("cloudflare/ssl_tls/http_strict_transport_security")
require ("cloudflare/ssl_tls/automatic_https_rewrites")
require ("cloudflare/caching/development_mode")
require ("cloudflare/caching/purge_cache")
require ("cloudflare/caching/caching_level")
require ("cloudflare/caching/browser_cache_expiration")
require ("cloudflare/caching/always_online")
require ("cloudflare/caching/enable_query_string_sort")
require ("cloudflare/caching/argo_tiered_cache.js")
require ("cloudflare/caching/crawler_hints.js")
require ("cloudflare/caching/tiered_cache_topology.js")
require ("cloudflare/overview/status")
require ("cloudflare/dns/cname_flattening")
require ("cloudflare/dns/custom_nameservers")
require ("cloudflare/dns/cloudflare_nameservers")
require ("cloudflare/dns/dns_records")
require ("cloudflare/scrape_shield/hotlink_protection")
require ("cloudflare/scrape_shield/email_address_obfuscation")
require ("cloudflare/scrape_shield/server_side_excludes")

$(window).on ( "load", function () {

	// Wrapper on all AJAX calls (detect session expiration)
	var oldAjax = $.ajax
	$.ajax = function () {
		var successCallback = arguments [ 0 ].success
		arguments [ 0 ].success = function ( response, status, xhr ) {
			if ( ( xhr.getResponseHeader ("content-type") || "" ).indexOf ("html") >= 0 ) {
				$(".cloudflare-dashboard").addClass ("logged-off")
				notification.showMessages ({
					errors: [
						{
							code: 42,
							message: "It appears that you are no longer logged in. Please refresh page and try again."
						}
					]
				})
			}
			else {
				successCallback.apply ( this, arguments )
			}
		}
		oldAjax.apply ( null, arguments )
	}

	if ( $(`.cloudflare-dashboard .tabs [data-tab='${window.localStorage.getItem ("cloudflare.tab") || "overview"}']`).length > 0 ) {
		$(`.cloudflare-dashboard .tabs [data-tab='${window.localStorage.getItem ("cloudflare.tab") || "overview"}']`).trigger ("click")
	}
	else {
		$(`.cloudflare-dashboard .tabs [data-tab='overview']`).trigger ("click")
	}

	$(".proxied").each ( ( index ) => {
		$(this).data ( "value", /proxied_on/.test ( $(this).attr ("src") ) )
	})

	const triggerEvent = function () {
		var section = $(this).closest ("section")
		var event = {
			"target": {
				"tab": $( section ).data ("tab-name"),
				"section": $( section ).data ("section-name"),
				"action": $(this).data ("target")
			},
			"form": {
				"endpoint": $(this).closest ("section").data ("endpoint").replace ( /(cloudflare\/[^\/]+\/)(index)?(.*)$/, "$1" + $(this).data ("target") + "$3" ),
				"key": $(this).closest ("section").data ("form-key")
			},
			"section": section,
			"trigger": $(this)
		}
		event.target.name = event.target.tab + "." + event.target.section + "." + event.target.action
		event.target.name = "cloudflare." + event.target.name
		$.event.trigger ( event.target.name, event )
		// console.log ( "Triggered: " + event.target.name )
	}

	$(document).on ( "click", ".trigger", triggerEvent )
	$(document).on ( "change", ".trigger-select", triggerEvent )
	$(document).on ( "change", ".trigger-radio", triggerEvent )
	$(document).on ( "keyup", ".trigger-change", triggerEvent )

})

$(document).on ( "click", "[data-tab]", function () {
	var section = $(this).closest ("section")
	if ( $(this).hasClass ("active") && !$(section).hasClass ("at_least_one") ) {
		$(section).find ("[data-tab-content]").removeClass ("active")
		$(section).find ("[data-tab]").removeClass ("active")
	}
	else {
		$(section).find ("[data-tab-content]").removeClass ("active")
		$(section).find ("[data-tab]").removeClass ("active")
		$(this).addClass ("active")
		$(section).find ("[data-tab-content='" + $(this).data ("tab") + "']").addClass ("active")
	}
})

$(document).on ( "change", ".dynamic-trigger", function () {
	const target = $(this).val ()
	$(this).parent ().find ("div[data-dynamic-wrapper]").removeClass ("active")
	$(this).parent ().find ("div[data-dynamic-wrapper='" + target + "']").addClass ("active")
	$(this).parent ().find ("[data-dynamic-show]").each ( function () {
		if ( $(this).data ("dynamic-show").includes ( target.toLowerCase () ) ) {
			$(this).show ()
		}
		else {
			$(this).hide ()
		}
	})
})

$(document).on ( "click", ".dynamic-trigger", function () {
	const target = $(this).data ("tab")
	if ( target ) {
		$(this).parent ().find ("div[data-dynamic-wrapper]").removeClass ("active")
		$(this).parent ().find ("div[data-dynamic-wrapper='" + target + "']").addClass ("active")
		$(this).parent ().find ("[data-dynamic-show]").each ( function () {
			if ( $(this).data ("dynamic-show").includes ( target.toLowerCase () ) ) {
				$(this).show ()
			}
			else {
				$(this).hide ()
			}
		})
	}
})

$(document).on ( "click", ".proxied", function () {
	let source = $(this).attr ("src")
	if ( /proxied_on/.test ( source ) ) {
		source = source.replace ( /proxied_on/, "proxied_off" )
		$(this).data ( "value", false )
	}
	else {
		source = source.replace ( /proxied_off/, "proxied_on" )
		$(this).data ( "value", true )
	}
	$(this).attr ( "src", source )
	if ( $(this).hasClass ("change") ) $(this).trigger ("change")
})

$(document).on ( "click", ".cloudflare-dashboard ul.tabs li", function () {
	let target = $(this).data ("tab")
	$(".cloudflare-dashboard .content").removeClass ("selected")
	$(".cloudflare-dashboard .tabs li").removeClass ("selected")
	$(`.cloudflare-dashboard .content[data-target='${target}']`).addClass ("selected")
	$(this).addClass ("selected")
	$(`.initialize.${target}`).addClass ("loading")
	window.localStorage.setItem ( "cloudflare.tab", target )
	common.loadSections (`.${target}`)
})
