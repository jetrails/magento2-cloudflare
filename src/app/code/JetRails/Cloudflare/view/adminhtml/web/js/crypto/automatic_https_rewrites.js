const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.crypto.automatic_https_rewrites.initialize", switchElement.initialize )
$(document).on ( "cloudflare.crypto.automatic_https_rewrites.toggle", switchElement.toggle )
