const $ = require ("jquery")
const selectElement = require ("cloudflare/generic/select")

$(document).on ( "cloudflare.ssl_tls.minimum_tls_version.initialize", selectElement.initialize )
$(document).on ( "cloudflare.ssl_tls.minimum_tls_version.update", selectElement.update )
