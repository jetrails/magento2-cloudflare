const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.ssl_tls.opportunistic_encryption.initialize", switchElement.initialize )
$(document).on ( "cloudflare.ssl_tls.opportunistic_encryption.toggle", switchElement.toggle )
