<?php

/**
 * Loaded via `php -d auto_prepend_file` ahead of phpcs so that Magento's
 * registration.php (pulled in by Composer's autoload.files) does not fatal
 * when the Magento framework is not installed. PHPCompatibility analyses
 * tokens, not runtime, so only the symbols registration.php touches at load
 * time need to exist.
 */

namespace Magento\Framework\Component {
	class ComponentRegistrar {
		const MODULE = "module";
		public static function register ( $type, $componentName, $path ) {}
	}
}
