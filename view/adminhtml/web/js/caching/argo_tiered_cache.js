const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.caching.argo_tiered_cache.initialize", switchElement.initialize )
$(document).on ( "cloudflare.caching.argo_tiered_cache.toggle", switchElement.toggle )
