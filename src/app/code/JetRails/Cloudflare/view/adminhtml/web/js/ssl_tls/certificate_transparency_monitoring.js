const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.ssl_tls.certificate_transparency_monitoring.initialize", switchElement.initializeCustom ( "enabled", true ) )
$(document).on ( "cloudflare.ssl_tls.certificate_transparency_monitoring.toggle", switchElement.toggle )
