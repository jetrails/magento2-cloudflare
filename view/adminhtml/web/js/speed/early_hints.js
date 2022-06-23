const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.speed.early_hints.initialize", switchElement.initialize )
$(document).on ( "cloudflare.speed.early_hints.toggle", switchElement.toggle )
