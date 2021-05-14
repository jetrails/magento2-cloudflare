const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.scrape_shield.server_side_excludes.initialize", switchElement.initialize )
$(document).on ( "cloudflare.scrape_shield.server_side_excludes.toggle", switchElement.toggle )
