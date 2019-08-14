const $ = require ("jquery")
const selectElement = require ("cloudflare/generic/select")

$(document).on ( "cloudflare.network.maximum_upload_size.initialize", selectElement.initialize )
$(document).on ( "cloudflare.network.maximum_upload_size.update", selectElement.update )
