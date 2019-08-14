const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.speed.image_resizing.initialize", switchElement.initialize )
$(document).on ( "cloudflare.speed.image_resizing.toggle", switchElement.toggle )
