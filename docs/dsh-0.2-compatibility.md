# DSH 0.2 compatibility

Version 0.1.0-rc.8.19 requires DSH 0.2.1-rc.3 or later with `ctx.agentLoop.modelResolutionVersion === 1` and the public `agent/resolve-model` event. The version alone is insufficient: a driver without that capability is rejected at plugin load. Redirects resolve before tools and prompt assembly; `agent/request` cannot change the captured route. Earlier plugin versions used the legacy request interception API.

The provider policy uses volatile Config values and ConfigForms. Redirect validation remains serializable and plugin messages use a named MessageSourceMap entry.

Install the fixed commit reachable from the repository main branch through dsh plugin. The shared environment stores full commit ids; local source paths are not portable plugin pins.

The maintenance lockfile disables implicit peer installation and uses the current Cordis and schemastery versions. Git packages build without depending on the source checkout node_modules.
