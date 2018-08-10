const $ = require ("jquery")
const selectElement = require ("cloudflare/generic/select")

$(document).on ( "cloudflare.crypto.tls_13.initialize", selectElement.initialize )
$(document).on ( "cloudflare.crypto.tls_13.update", selectElement.update )
