const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.caching.enable_query_string_sort.initialize", switchElement.initialize )
$(document).on ( "cloudflare.caching.enable_query_string_sort.toggle", switchElement.toggle )
