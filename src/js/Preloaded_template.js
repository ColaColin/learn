var preloaded = (function() {
	function PreloadResourcesManager() {
		var self = this;
		var resources = {};
		
		self.preloadData = function(key, data) {
			resources[key] = data;
		};
		
		self.getResource = function(url) {
			return resources[url];
		};
		
		self.get = self.getResource;
		
		self.listResources = function() {
			return Object.keys(resources);
		};
	};
	
	var preloaded = new PreloadResourcesManager();

	//RES_HERE
	
	// the build process will replace the above comment with code that has the shaders baked in and adds them to the loaded resources
	// like this: preloaded.preloadData(key, data);preloaded.preloadData(key, data), ...
	
	return preloaded;
})();

module.exports = preloaded;