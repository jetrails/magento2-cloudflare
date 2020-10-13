const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.speed.prefetch_urls.initialize", switchElement.initialize )
$(document).on ( "cloudflare.speed.prefetch_urls.toggle", switchElement.toggle )
