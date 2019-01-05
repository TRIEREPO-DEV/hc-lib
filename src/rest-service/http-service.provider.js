angular.module('hcLib').provider('httpService', function() {
	var basePath = '';
	try {
		basePath = location.href.split('/')[3];
	} catch(err) {
		basePath = '';
	}

	this.setBasePath = function(_basePath) {
		basePath = _basePath;
	};

	this.$get = ['$http', '$q', function httpService($http, $q) {
		return {
			get: reqWithoutPayload.bind(null, 'GET'),
			del: reqWithoutPayload.bind(null, 'DELETE'),
			put: reqWithPayload.bind(null, 'PUT'),
			post: reqWithPayload.bind(null, 'POST'),
			upload: upload.bind(null, 'POST'),
			getJSON: getJSON.bind(null, 'GET'),
			download:download.bind(null)
		};
	
		function reqWithoutPayload(reqType, url, urlParams, nullAllowed) {
			url = _appendUrlParams(url, urlParams, nullAllowed);
			return _sendRequest({
				method: reqType,
				url: url
			});
		}
	
		function reqWithPayload(reqType, url, payload, urlParams, nullAllowed) {
			url = _appendUrlParams(url, urlParams, nullAllowed);
			return _sendRequest({
				method: reqType,
				url: url,
				data: payload
			});
		}
		
		function upload(reqType, url, formData, urlParams, nullAllowed) {
			url = _appendUrlParams(url, urlParams, nullAllowed);
			return _sendRequest({
				url: url,
				method: reqType,
				data: formData,
				transformRequest: angular.identity,
				headers: { 'Content-Type': undefined }
			});
		}
		
		function download(url, payload, urlParams, filename, nullAllowed, method){
			var defer =  $q.defer();
			url = _appendUrlParams(url, urlParams, nullAllowed);
			
			$http({
				url: url,
				method: method || 'GET',
				data: payload,
				responseType: 'arraybuffer'
			}).success(function (data) {
				var blob = new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
				var objectUrl = URL.createObjectURL(blob);
				saveAs(blob, filename);
				defer.resolve({msg: 'Download success', content: objectUrl});
			}).error(function (data) {
				defer.reject({msg: 'Download Failed', content: data});
			});

			return defer.promise;
		}

		function saveAs(blob, fileName){
			var url = window.URL.createObjectURL(blob);
		
			var doc = document.createElement("a");
			doc.href = url;
			doc.download = fileName;
			doc.click();
			window.URL.revokeObjectURL(url);
		}
		function getJSON(reqType, url, cacheKey) {
			if (cacheKey && localStorage.getItem(cacheKey)) {
				return $q.when(null).then(function() {
					var cacheData = localStorage.getItem(cacheKey);
					return JSON.parse(cacheData);
				});
			} else {
				return reqWithoutPayload(reqType, url).then(function(res) {
					localStorage.setItem(cacheKey, res.json);
					return res;
				});
			}
		}
		
		function _appendUrlParams(url, urlParams, nullAllowed) {
			if (urlParams) {
				url += '?' + toURLParams(urlParams, nullAllowed);
			}
			return '/' + basePath + '/' + url;
		}
		
		function _sendRequest(req) {
			var defer = $q.defer();
			$http(req).success(function(res) {
				if (res.isSuccess) {
					defer.resolve(res.response);
				} else {
					defer.reject(res);
				}
			}).error(function(err) {
				defer.reject(err);
			});
			return defer.promise;
		}
	}];
});
