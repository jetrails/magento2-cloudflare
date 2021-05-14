const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.firewall.javascript_detections.initialize", switchElement.initializeCustom ( "enable_js", true ) )
$(document).on ( "cloudflare.firewall.javascript_detections.toggle", switchElement.toggle )
