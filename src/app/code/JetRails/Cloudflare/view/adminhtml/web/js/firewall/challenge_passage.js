const $ = require ("jquery")
const selectElement = require ("cloudflare/generic/select")

$(document).on ( "cloudflare.firewall.challenge_passage.initialize", selectElement.initialize )
$(document).on ( "cloudflare.firewall.challenge_passage.update", selectElement.update )
