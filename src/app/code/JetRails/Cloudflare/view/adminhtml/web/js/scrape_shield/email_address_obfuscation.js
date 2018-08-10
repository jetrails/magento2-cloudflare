const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.scrape_shield.email_address_obfuscation.initialize", switchElement.initialize )
$(document).on ( "cloudflare.scrape_shield.email_address_obfuscation.toggle", switchElement.toggle )
