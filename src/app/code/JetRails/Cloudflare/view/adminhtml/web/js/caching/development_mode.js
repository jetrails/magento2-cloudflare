const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.caching.development_mode.initialize", switchElement.initialize )
$(document).on ( "cloudflare.caching.development_mode.toggle", switchElement.toggle )
