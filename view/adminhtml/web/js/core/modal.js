const $ = jQuery = jquery = require ("jquery")

function createComponents ( large ) {
	let container = $("<div class='container' >")
	if ( large && typeof large !== "boolean" ) {
		$( container ).css ({ width: large + "px" })
	}
	else if ( large ) {
		$( container ).css ({ width: "630px" })
	}
	return {
		modal: $("<div class='cloudflare_modal' >"),
		container: container,
		close: $("<div class='close cloudflare-font' >").html ("&#xF01A")
	}
}

function bindComponents ( components ) {
	$( components.close ).on ( "click", function () {
		$( components.modal ).removeClass ("active")
		setTimeout ( function () { $( components.modal ).remove () }, 1000 )
	})
}

function render ( components ) {
	$("body").append (
		components.modal.append (
			components.container.append ( components.close )
		)
	)
}

function Modal ( large = false ) {
	const components = createComponents ( large )
	bindComponents ( components )

	return {
		components: components,
		addTitle: ( title, subTitle = "" ) => {
			let titleElement = $("<div class='title' >")
			$( components.container ).append ( titleElement.html ( title ) )
			if ( subTitle.trim () !== "" ) {
				$( titleElement ).append ( $("<div class='sub-title' >").text ( subTitle ) )
			}
		},
		addRow: ( label, element, tight = false ) => {
			let row = $("<div class='row' >")
			if ( tight ) $( row ).addClass ("tight")
			row.append ( $("<div class='label' >").html ( label ) )
			row.append ( $("<div class='element' >").html ( element ) )
			$( components.container ).append ( row )
		},
		addButton: ( options ) => {
			if ( !( "buttonsContainer" in components ) ) {
				components.buttonsContainer = $("<div class='buttons' >")
				$(components.container).append ( components.buttonsContainer )
			}
			var button = $(`<input type="button" class="${options.class}" value="${options.label}" />`)
			if ( "callback" in options ) $( button ).on ( "click", options.callback.bind ( null, components ) )
			$(components.buttonsContainer).append ( button )
		},
		addElement: ( element ) => {
			$(components.container).append ( element )
		},
		close: () => {
			$(".cloudflare_modal").removeClass ("active")
			setTimeout ( function () { $( components.modal ).remove () }, 1000 )
		},
		show: () => {
			$("*").blur ()
			render ( components )
			setTimeout ( function () {
				$( components.modal ).addClass ("active")
				$( components.modal ).find ("input,textarea,select").first ().focus ()
			}, 200 )
		}
	}
}

function confirm () {
	var modal = $("<div class='cloudflare_modal' >")
	var container = $("<div class='container' >")
	var close = $("<div class='close' >")
	$( close ).on ( "click", function () {
		$(".cloudflare_modal").removeClass ("active")
		setTimeout ( function () { $( modal ).remove () }, 1000 )
	})
	$("body").append ( modal.append ( container.append ( close ) ) )
	setTimeout ( function () { $( modal ).addClass ("active") }, 200 )
}

function createInput ( type = "text", name, placeholder = "", value = "" ) {
	return $(`<input type="${type}" name="${name}" placeholder="${placeholder}" value="${value}" />`)
}

function createRow ( label, element ) {
	return $("<div class='row tight' >")
		.html ( $("<div class='label' >").text ( label ) )
		.append ( element )
}

function createRows () {
	let rows = $("<div class='rows' >")
	for ( let i in arguments ) {
		$(rows).append ( arguments [ i ] )
	}
	return rows
}

function createSelect ( name, options, multiple = false ) {
	let select = $(`<select name='${name}' ${multiple ? "multiple" : ""} >`)
	options = options.map ( option => {
		var element = new Option ( option.label, option.value )
		if ( option.selected ) $(element).prop ( "selected", true )
		if ( option.disabled ) $(element).prop ( "disabled", true )
		return element
	})
	$(select).append ( options )
	return select
}

function createTextarea ( name, placeholder = "", value = "" ) {
	let textarea = $(`<textarea name="${name}" placeholder="${placeholder}" >`).text ( value )
	return textarea
}

function createSwitch ( name, state = false ) {
	return $(`<label class="switch" >`)
		.append ( $(`<input type="checkbox" name="${name}" >`).prop ( "checked", state ) )
		.append ( $(`<span class="knob" >`) )
}

function createIconButton ( className, icon ) {
	return $(`<div class="icon-button cloudflare-font ${className}" >`).html ( icon )
}

module.exports = {
	Modal: Modal,
	confirm: confirm,
	createInput: createInput,
	createSelect: createSelect,
	createRows: createRows,
	createRow: createRow,
	createTextarea: createTextarea,
	createSwitch: createSwitch,
	createIconButton: createIconButton
}
