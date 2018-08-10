const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.crypto.always_use_https.initialize", switchElement.initialize )
$(document).on ( "cloudflare.crypto.always_use_https.toggle", switchElement.toggle )
