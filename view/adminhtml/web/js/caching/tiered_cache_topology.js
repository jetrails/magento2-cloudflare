const $ = jQuery = jquery = require ("jquery")
const selectElement = require ("cloudflare/generic/select")

$(document).on ( "cloudflare.caching.tiered_cache_topology.initialize", selectElement.initialize )
$(document).on ( "cloudflare.caching.tiered_cache_topology.update", selectElement.update )
