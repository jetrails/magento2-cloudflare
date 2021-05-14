const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.ssl_tls.automatic_https_rewrites.initialize", switchElement.initialize )
$(document).on ( "cloudflare.ssl_tls.automatic_https_rewrites.toggle", switchElement.toggle )
