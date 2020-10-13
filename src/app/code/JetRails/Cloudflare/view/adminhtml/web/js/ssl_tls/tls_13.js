const $ = require ("jquery")
const selectElement = require ("cloudflare/generic/select")

$(document).on ( "cloudflare.ssl_tls.tls_13.initialize", selectElement.initialize )
$(document).on ( "cloudflare.ssl_tls.tls_13.update", selectElement.update )
