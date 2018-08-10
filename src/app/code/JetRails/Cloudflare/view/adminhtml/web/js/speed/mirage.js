const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.speed.mirage.initialize", switchElement.initialize )
$(document).on ( "cloudflare.speed.mirage.toggle", switchElement.toggle )
