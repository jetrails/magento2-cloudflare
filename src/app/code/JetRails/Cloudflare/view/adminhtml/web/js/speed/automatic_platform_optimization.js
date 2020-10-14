const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.speed.automatic_platform_optimization.initialize", switchElement.initializeCustom ( [ "value", "enabled" ], true ) )
$(document).on ( "cloudflare.speed.automatic_platform_optimization.toggle", switchElement.toggle )
