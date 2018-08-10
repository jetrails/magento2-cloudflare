const $ = require ("jquery")
const selectElement = require ("cloudflare/generic/select")

$(document).on ( "cloudflare.crypto.ssl.initialize", selectElement.initialize )
$(document).on ( "cloudflare.crypto.ssl.update", selectElement.update )
