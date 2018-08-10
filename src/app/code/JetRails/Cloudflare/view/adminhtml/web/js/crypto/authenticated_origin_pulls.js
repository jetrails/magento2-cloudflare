const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.crypto.authenticated_origin_pulls.initialize", switchElement.initialize )
$(document).on ( "cloudflare.crypto.authenticated_origin_pulls.toggle", switchElement.toggle )
