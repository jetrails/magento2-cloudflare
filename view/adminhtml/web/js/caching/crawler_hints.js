const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.caching.crawler_hints.initialize", switchElement.initialize )
$(document).on ( "cloudflare.caching.crawler_hints.toggle", switchElement.toggle )
