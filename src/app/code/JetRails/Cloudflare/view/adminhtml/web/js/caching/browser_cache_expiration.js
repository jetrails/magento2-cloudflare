const $ = require ("jquery")
const selectElement = require ("cloudflare/generic/select")

$(document).on ( "cloudflare.caching.browser_cache_expiration.initialize", selectElement.initialize )
$(document).on ( "cloudflare.caching.browser_cache_expiration.update", selectElement.update )
