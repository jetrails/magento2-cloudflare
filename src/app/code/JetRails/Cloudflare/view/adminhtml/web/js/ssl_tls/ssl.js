const $ = require ("jquery")
const selectElement = require ("cloudflare/generic/select")

$(document).on ( "cloudflare.ssl_tls.ssl.initialize", selectElement.initialize )
$(document).on ( "cloudflare.ssl_tls.ssl.update", selectElement.update )
