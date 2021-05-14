const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.ssl_tls.authenticated_origin_pulls.initialize", switchElement.initialize )
$(document).on ( "cloudflare.ssl_tls.authenticated_origin_pulls.toggle", switchElement.toggle )
