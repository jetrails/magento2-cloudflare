const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.scrape_shield.hotlink_protection.initialize", switchElement.initialize )
$(document).on ( "cloudflare.scrape_shield.hotlink_protection.toggle", switchElement.toggle )
