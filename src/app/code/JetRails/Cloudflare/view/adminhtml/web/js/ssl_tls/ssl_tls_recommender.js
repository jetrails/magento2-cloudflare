const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.ssl_tls.ssl_tls_recommender.initialize", switchElement.initializeCustom ( "enabled", true ) )
$(document).on ( "cloudflare.ssl_tls.ssl_tls_recommender.toggle", switchElement.toggle )
