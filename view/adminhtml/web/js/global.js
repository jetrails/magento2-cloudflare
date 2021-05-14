function getDomainName () {
	return window.domain
}

function getSkinBaseUrl ( path = "" ) {
	return window.skin_base + path
}

module.exports = { getDomainName, getSkinBaseUrl }
