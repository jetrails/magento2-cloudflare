const $ = jQuery = jquery = require ("jquery")
const selectElement = require ("cloudflare/generic/select")

$(document).on ( "cloudflare.speed.image_resizing.initialize", selectElement.initialize )
$(document).on ( "cloudflare.speed.image_resizing.update", selectElement.update )
