const $ = require ("jquery")
const notification = require ("cloudflare/core/notification")
const common = require ("cloudflare/common")
const global = require ("cloudflare/global")
const requireAll = ( r ) => { r.keys ().forEach ( r ) }

requireAll ( require.context ("cloudflare/overview", true, /\.js$/ ) )
requireAll ( require.context ("cloudflare/caching", true, /\.js$/ ) )
requireAll ( require.context ("cloudflare/ssl_tls", true, /\.js$/ ) )
requireAll ( require.context ("cloudflare/speed", true, /\.js$/ ) )
requireAll ( require.context ("cloudflare/dns", true, /\.js$/ ) )
requireAll ( require.context ("cloudflare/firewall", true, /\.js$/ ) )
requireAll ( require.context ("cloudflare/page_rules", true, /\.js$/ ) )
requireAll ( require.context ("cloudflare/network", true, /\.js$/ ) )
requireAll ( require.context ("cloudflare/scrape_shield", true, /\.js$/ ) )

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

	// common.loadSections (`.${window.localStorage.getItem ("cloudflare.tab") || "overview"}`)
	$(`.cloudflare-dashboard .tabs [data-tab='${window.localStorage.getItem ("cloudflare.tab") || "overview"}']`).trigger ("click")

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
				"endpoint": $(this).closest ("section").data ("endpoint").replace ( /(cloudflare\/[^\/]+\/)(index)(.*)$/, "$1" + $(this).data ("target") + "$3" ),
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
