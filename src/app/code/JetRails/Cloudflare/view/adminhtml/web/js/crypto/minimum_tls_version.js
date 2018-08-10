const $ = require ("jquery")
const selectElement = require ("cloudflare/generic/select")

$(document).on ( "cloudflare.crypto.minimum_tls_version.initialize", selectElement.initialize )
$(document).on ( "cloudflare.crypto.minimum_tls_version.update", selectElement.update )
