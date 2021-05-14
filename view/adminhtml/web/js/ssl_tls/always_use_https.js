const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.ssl_tls.always_use_https.initialize", switchElement.initialize )
$(document).on ( "cloudflare.ssl_tls.always_use_https.toggle", switchElement.toggle )
