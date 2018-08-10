const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.crypto.opportunistic_encryption.initialize", switchElement.initialize )
$(document).on ( "cloudflare.crypto.opportunistic_encryption.toggle", switchElement.toggle )
