const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.speed.rocket_loader.initialize", switchElement.initialize )
$(document).on ( "cloudflare.speed.rocket_loader.toggle", switchElement.toggle )
