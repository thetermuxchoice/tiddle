/*
 * easy-autocomplete
 * jQuery plugin for autocompletion
 * 
 * @author Łukasz Pawełczak (http://github.com/pawelczak)
 * @version 1.3.5
 * Copyright  License: 
 */

/*
 * EasyAutocomplete - Configuration 
 */
var EasyAutocomplete = (function(scope){

	scope.Configuration = function Configuration(options) {
		var defaults = {
			data: "list-required",
			url: "list-required",
			dataType: "json",

			listLocation: function(data) {
				return data;
			},

			xmlElementName: "",

			getValue: function(element) {
				return element;
			},

			autocompleteOff: true,

			placeholder: false,

			ajaxCallback: function() {},

			matchResponseProperty: false,

			list: {
				sort: {
					enabled: false,
					method: function(a, b) {
						a = defaults.getValue(a);
						b = defaults.getValue(b);
						if (a < b) {
							return -1;
						}
						if (a > b) {
							return 1;
						}
						return 0;
					}
				},

				maxNumberOfElements: 99,

				hideOnEmptyPhrase: true,

				match: {
					enabled: false,
					caseSensitive: false,
					method: function(element, phrase) {

						if (element.search(phrase) > -1) {
							return true;
						} else {
							return false;
						}
					}
				},

				showAnimation: {
					type: "normal", //normal|slide|fade
					time: 400,
					callback: function() {}
				},

				hideAnimation: {
					type: "normal",
					time: 400,
					callback: function() {}
				},

				/* Events */
				onClickEvent: function() {},
				onSelectItemEvent: function() {},
				onLoadEvent: function() {},
				onChooseEvent: function() {},
				onKeyEnterEvent: function() {},
				onMouseOverEvent: function() {},
				onMouseOutEvent: function() {},	
				onShowListEvent: function() {},
				onHideListEvent: function() {}
			},

			highlightPhrase: true,

			theme: "",

			cssClasses: "",

			minCharNumber: 0,

			requestDelay: 0,

			adjustWidth: true,

			ajaxSettings: { type: 'POST' },

			preparePostData: function(data, inputPhrase) {return data;},

			loggerEnabled: true,

			template: "",

			categoriesAssigned: false,

			categories: [{
				maxNumberOfElements: 4
			}]

		};
		
		var externalObjects = ["ajaxSettings", "template"];

		this.get = function(propertyName) {
			return defaults[propertyName];
		};

		this.equals = function(name, value) {
			if (isAssigned(name)) {
				if (defaults[name] === value) {
					return true;
				}
			} 
			
			return false;
		};

		this.checkDataUrlProperties = function() {
			if (defaults.url === "list-required" && defaults.data === "list-required") {
				return false;
			}
			return true;
		};
		this.checkRequiredProperties = function() {
			for (var propertyName in defaults) {
				if (defaults[propertyName] === "required") {
					logger.error("Option " + propertyName + " must be defined");
					return false;
				}
			}
			return true;
		};

		this.printPropertiesThatDoesntExist = function(consol, optionsToCheck) {
			printPropertiesThatDoesntExist(consol, optionsToCheck);
		};


		prepareDefaults();

		mergeOptions();

		if (defaults.loggerEnabled === true) {
			printPropertiesThatDoesntExist(console, options);	
		}

		addAjaxSettings();

		processAfterMerge();
		function prepareDefaults() {

			if (options.dataType === "xml") {
				
				if (!options.getValue) {

					options.getValue = function(element) {
						return jQuery(element).text();
					};
				}

				
				if (!options.list) {

					options.list = {};
				} 

				if (!options.list.sort) {
					options.list.sort = {};
				}


				options.list.sort.method = function(a, b) {
					a = options.getValue(a);
					b = options.getValue(b);
					if (a < b) {
						return -1;
					}
					if (a > b) {
						return 1;
					}
					return 0;
				};

				if (!options.list.match) {
					options.list.match = {};
				}

				options.list.match.method = function(element, phrase) {

					if (element.search(phrase) > -1) {
						return true;
					} else {
						return false;
					}
				};

			}
			if (options.categories !== undefined && options.categories instanceof Array) {

				var categories = [];

				for (var i = 0, length = options.categories.length; i < length; i += 1) { 

					var category = options.categories[i];

					for (var property in defaults.categories[0]) {

						if (category[property] === undefined) {
							category[property] = defaults.categories[0][property];
						}
					}

					categories.push(category);
				}

				options.categories = categories;
			}
		}

		function mergeOptions() {

			defaults = mergeObjects(defaults, options);

			function mergeObjects(source, target) {
				var mergedObject = source || {};

				for (var propertyName in source) {
					if (target[propertyName] !== undefined && target[propertyName] !== null) {

						if (typeof target[propertyName] !== "object" || 
								target[propertyName] instanceof Array) {
							mergedObject[propertyName] = target[propertyName];
						} else {
							mergeObjects(source[propertyName], target[propertyName]);
						}
					}
				}
			
				/* If data is an object */
				if (target.data !== undefined && target.data !== null && typeof target.data === "object") {
					mergedObject.data = target.data;
				}

				return mergedObject;
			}
		}	


		function processAfterMerge() {
			
			if (defaults.url !== "list-required" && typeof defaults.url !== "function") {
				var defaultUrl = defaults.url;
				defaults.url = function() {
					return defaultUrl;
				};
			}

			if (defaults.ajaxSettings.url !== undefined && typeof defaults.ajaxSettings.url !== "function") {
				var defaultUrl = defaults.ajaxSettings.url;
				defaults.ajaxSettings.url = function() {
					return defaultUrl;
				};
			}

			if (typeof defaults.listLocation === "string") {
				var defaultlistLocation = defaults.listLocation;

				if (defaults.dataType.toUpperCase() === "XML") {
					defaults.listLocation = function(data) {
						return jQuery(data).find(defaultlistLocation);
					};
				} else {
					defaults.listLocation = function(data) {
						return data[defaultlistLocation];
					};	
				}
			}

			if (typeof defaults.getValue === "string") {
				var defaultsGetValue = defaults.getValue;
				defaults.getValue = function(element) {
					return element[defaultsGetValue];
				};
			}

			if (options.categories !== undefined) {
				defaults.categoriesAssigned = true;
			}

		}

		function addAjaxSettings() {

			if (options.ajaxSettings !== undefined && typeof options.ajaxSettings === "object") {
				defaults.ajaxSettings = options.ajaxSettings;
			} else {
				defaults.ajaxSettings = {};	
			}
			
		}

		function isAssigned(name) {
			if (defaults[name] !== undefined && defaults[name] !== null) {
				return true;
			} else {
				return false;
			}
		}
		function printPropertiesThatDoesntExist(consol, optionsToCheck) {
			
			checkPropertiesIfExist(defaults, optionsToCheck);

			function checkPropertiesIfExist(source, target) {
				for(var property in target) {
					if (source[property] === undefined) {
						console.log("Property '" + property + "' does not exist in EasyAutocomplete options API.");		
					}

					if (typeof source[property] === "object") {
						checkPropertiesIfExist(source[property], target[property]);
					}
				}	
			}
		}
	};

	return scope;

})(EasyAutocomplete || {});


/*
 * EasyAutocomplete - Logger 
 */
var EasyAutocomplete = (function(scope){
	
	scope.Logger = function Logger() {

		this.error = function(message) {
			console.log("ERROR: " + message);
		};

		this.warning = function(message) {
			console.log("WARNING: " + message);
		};
	};

	return scope;

})(EasyAutocomplete || {});
	

/*
 * EasyAutocomplete - Constans
 */
var EasyAutocomplete = (function(scope){	
	
	scope.Constans = function Constans() {
		var constants = {
			CONTAINER_CLASS: "easy-autocomplete-container",
			CONTAINER_ID: "eac-container-",

			WRAPPER_CSS_CLASS: "easy-autocomplete"
		};

		this.getValue = function(propertyName) {
			return constants[propertyName];
		};

	};

	return scope;

})(EasyAutocomplete || {});

/*
 * EasyAutocomplete - ListBuilderService 
 *
 * @author Łukasz Pawełczak 
 *
 */
var EasyAutocomplete = (function(scope) {

	scope.ListBuilderService = function ListBuilderService(configuration, proccessResponseData) {


		this.init = function(data) {
			var listBuilder = [],
				builder = {};

			builder.data = configuration.get("listLocation")(data);
			builder.getValue = configuration.get("getValue");
			builder.maxListSize = configuration.get("list").maxNumberOfElements;

				
			listBuilder.push(builder);

			return listBuilder;
		};

		this.updateCategories = function(listBuilder, data) {
			
			if (configuration.get("categoriesAssigned")) {

				listBuilder = [];

				for(var i = 0; i < configuration.get("categories").length; i += 1) {

					var builder = convertToListBuilder(configuration.get("categories")[i], data);

					listBuilder.push(builder);
				}

			} 

			return listBuilder;
		};

		this.convertXml = function(listBuilder) {
			if(configuration.get("dataType").toUpperCase() === "XML") {

				for(var i = 0; i < listBuilder.length; i += 1) {
					listBuilder[i].data = convertXmlToList(listBuilder[i]);
				}
			}

			return listBuilder;
		};

		this.processData = function(listBuilder, inputPhrase) {

			for(var i = 0, length = listBuilder.length; i < length; i+=1) {
				listBuilder[i].data = proccessResponseData(configuration, listBuilder[i], inputPhrase);
			}

			return listBuilder;
		};

		this.checkIfDataExists = function(listBuilders) {

			for(var i = 0, length = listBuilders.length; i < length; i += 1) {

				if (listBuilders[i].data !== undefined && listBuilders[i].data instanceof Array) {
					if (listBuilders[i].data.length > 0) {
						return true;
					}
				} 
			}

			return false;
		};


		function convertToListBuilder(category, data) {

			var builder = {};

			if(configuration.get("dataType").toUpperCase() === "XML") {

				builder = convertXmlToListBuilder();
			} else {

				builder = convertDataToListBuilder();
			}
			

			if (category.header !== undefined) {
				builder.header = category.header;
			}

			if (category.maxNumberOfElements !== undefined) {
				builder.maxNumberOfElements = category.maxNumberOfElements;
			}

			if (configuration.get("list").maxNumberOfElements !== undefined) {

				builder.maxListSize = configuration.get("list").maxNumberOfElements;
			}

			if (category.getValue !== undefined) {

				if (typeof category.getValue === "string") {
					var defaultsGetValue = category.getValue;
					builder.getValue = function(element) {
						return element[defaultsGetValue];
					};
				} else if (typeof category.getValue === "function") {
					builder.getValue = category.getValue;
				}

			} else {
				builder.getValue = configuration.get("getValue");	
			}
			

			return builder;


			function convertXmlToListBuilder() {

				var builder = {},
					listLocation;

				if (category.xmlElementName !== undefined) {
					builder.xmlElementName = category.xmlElementName;
				}

				if (category.listLocation !== undefined) {

					listLocation = category.listLocation;
				} else if (configuration.get("listLocation") !== undefined) {

					listLocation = configuration.get("listLocation");
				}

				if (listLocation !== undefined) {
					if (typeof listLocation === "string") {
						builder.data = jQuery(data).find(listLocation);
					} else if (typeof listLocation === "function") {

						builder.data = listLocation(data);
					}
				} else {

					builder.data = data;
				}

				return builder;
			}


			function convertDataToListBuilder() {

				var builder = {};

				if (category.listLocation !== undefined) {

					if (typeof category.listLocation === "string") {
						builder.data = data[category.listLocation];
					} else if (typeof category.listLocation === "function") {
						builder.data = category.listLocation(data);
					}
				} else {
					builder.data = data;
				}

				return builder;
			}
		}

		function convertXmlToList(builder) {
			var simpleList = [];

			if (builder.xmlElementName === undefined) {
				builder.xmlElementName = configuration.get("xmlElementName");
			}


			jQuery(builder.data).find(builder.xmlElementName).each(function() {
				simpleList.push(this);
			});

			return simpleList;
		}

	};

	return scope;

})(EasyAutocomplete || {});


/*
 * EasyAutocomplete - Data proccess module
 *
 * Process list to display:
 * - sort 
 * - decrease number to specific number
 * - show only matching list
 *
 */
var EasyAutocomplete = (function(scope) {

	scope.proccess = function proccessData(config, listBuilder, phrase) {

		scope.proccess.match = match;

		var list = listBuilder.data,
			inputPhrase = phrase;//TODO REFACTOR

		list = findMatch(list, inputPhrase);
		list = reduceElementsInList(list);
		list = sort(list);

		return list;


		function findMatch(list, phrase) {
			var preparedList = [],
				value = "";

			if (config.get("list").match.enabled) {

				for(var i = 0, length = list.length; i < length; i += 1) {

					value = config.get("getValue")(list[i]);
					
					if (match(value, phrase)) {
						preparedList.push(list[i]);	
					}
					
				}

			} else {
				preparedList = list;
			}

			return preparedList;
		}

		function match(value, phrase) {

			if (!config.get("list").match.caseSensitive) {

				if (typeof value === "string") {
					value = value.toLowerCase();	
				}
				
				phrase = phrase.toLowerCase();
			}
			if (config.get("list").match.method(value, phrase)) {
				return true;
			} else {
				return false;
			}
		}

		function reduceElementsInList(list) {
			if (listBuilder.maxNumberOfElements !== undefined && list.length > listBuilder.maxNumberOfElements) {
				list = list.slice(0, listBuilder.maxNumberOfElements);
			}

			return list;
		}

		function sort(list) {
			if (config.get("list").sort.enabled) {
				list.sort(config.get("list").sort.method);
			}

			return list;
		}
		
	};


	return scope;


})(EasyAutocomplete || {});


/*
 * EasyAutocomplete - Template 
 *
 * 
 *
 */
var EasyAutocomplete = (function(scope){

	scope.Template = function Template(options) {


		var genericTemplates = {
			basic: {
				type: "basic",
				method: function(element) { return element; },
				cssClass: ""
			},
			description: {
				type: "description",
				fields: {
					description: "description"
				},
				method: function(element) {	return element + " - description"; },
				cssClass: "eac-description"
			},
			iconLeft: {
				type: "iconLeft",
				fields: {
					icon: ""
				},
				method: function(element) {
					return element;
				},
				cssClass: "eac-icon-left"
			},
			iconRight: {
				type: "iconRight",
				fields: {
					iconSrc: ""
				},
				method: function(element) {
					return element;
				},
				cssClass: "eac-icon-right"
			},
			links: {
				type: "links",
				fields: {
					link: ""
				},
				method: function(element) {
					return element;
				},
				cssClass: ""
			},
			custom: {
				type: "custom",
				method: function() {},
				cssClass: ""
			}
		},



		/*
		 * Converts method with {{text}} to function
		 */
		convertTemplateToMethod = function(template) {


			var _fields = template.fields,
				buildMethod;

			if (template.type === "description") {

				buildMethod = genericTemplates.description.method; 

				if (typeof _fields.description === "string") {
					buildMethod = function(elementValue, element) {
						return elementValue + " - <span>" + element[_fields.description] + "</span>";
					};					
				} else if (typeof _fields.description === "function") {
					buildMethod = function(elementValue, element) {
						return elementValue + " - <span>" + _fields.description(element) + "</span>";
					};	
				}

				return buildMethod;
			}

			if (template.type === "iconRight") {

				if (typeof _fields.iconSrc === "string") {
					buildMethod = function(elementValue, element) {
						return elementValue + "<img class='eac-icon' src='" + element[_fields.iconSrc] + "' />" ;
					};					
				} else if (typeof _fields.iconSrc === "function") {
					buildMethod = function(elementValue, element) {
						return elementValue + "<img class='eac-icon' src='" + _fields.iconSrc(element) + "' />" ;
					};
				}

				return buildMethod;
			}


			if (template.type === "iconLeft") {

				if (typeof _fields.iconSrc === "string") {
					buildMethod = function(elementValue, element) {
						return "<img class='eac-icon' src='" + element[_fields.iconSrc] + "' />" + elementValue;
					};					
				} else if (typeof _fields.iconSrc === "function") {
					buildMethod = function(elementValue, element) {
						return "<img class='eac-icon' src='" + _fields.iconSrc(element) + "' />" + elementValue;
					};
				}

				return buildMethod;
			}

			if(template.type === "links") {

				if (typeof _fields.link === "string") {
					buildMethod = function(elementValue, element) {
						return "<a href='" + element[_fields.link] + "' >" + elementValue + "</a>";
					};					
				} else if (typeof _fields.link === "function") {
					buildMethod = function(elementValue, element) {
						return "<a href='" + _fields.link(element) + "' >" + elementValue + "</a>";
					};
				}

				return buildMethod;
			}


			if (template.type === "custom") {

				return template.method;
			}

			return genericTemplates.basic.method;

		},


		prepareBuildMethod = function(options) {
			if (!options || !options.type) {

				return genericTemplates.basic.method;
			}

			if (options.type && genericTemplates[options.type]) {

				return convertTemplateToMethod(options);
			} else {

				return genericTemplates.basic.method;
			}

		},

		templateClass = function(options) {
			var emptyStringFunction = function() {return "";};

			if (!options || !options.type) {

				return emptyStringFunction;
			}

			if (options.type && genericTemplates[options.type]) {
				return (function () { 
					var _cssClass = genericTemplates[options.type].cssClass;
					return function() { return _cssClass;};
				})();
			} else {
				return emptyStringFunction;
			}
		};


		this.getTemplateClass = templateClass(options);

		this.build = prepareBuildMethod(options);


	};

	return scope;

})(EasyAutocomplete || {});


/*
 * EasyAutocomplete - jQuery plugin for autocompletion
 *
 */
var EasyAutocomplete = (function(scope) {

	
	scope.main = function Core($input, options) {
				
		var module = {
				name: "EasyAutocomplete",
				shortcut: "eac"
			};

		var consts = new scope.Constans(),
			config = new scope.Configuration(options),
			logger = new scope.Logger(),
			template = new scope.Template(options.template),
			listBuilderService = new scope.ListBuilderService(config, scope.proccess),
			checkParam = config.equals,

			$field = $input, 
			$container = "",
			elementsList = [],
			selectedElement = -1,
			requestDelayTimeoutId;

		scope.consts = consts;

		this.getConstants = function() {
			return consts;
		};

		this.getConfiguration = function() {
			return config;
		};

		this.getContainer = function() {
			return $container;
		};

		this.getSelectedItemIndex = function() {
			return selectedElement;
		};

		this.getItems = function () {
			return elementsList;
		};

		this.getItemData = function(index) {

			if (elementsList.length < index || elementsList[index] === undefined) {
				return -1;
			} else {
				return elementsList[index];
			}
		};

		this.getSelectedItemData = function() {
			return this.getItemData(selectedElement);
		};

		this.build = function() {
			prepareField();
		};

		this.init = function() {
			init();
		};
		function init() {

			if ($field.length === 0) {
				logger.error("Input field doesn't exist.");
				return;
			}

			if (!config.checkDataUrlProperties()) {
				logger.error("One of options variables 'data' or 'url' must be defined.");
				return;
			}

			if (!config.checkRequiredProperties()) {
				logger.error("Will not work without mentioned properties.");
				return;
			}


			prepareField();
			bindEvents();	

		}
		function prepareField() {

				
			if ($field.parent().hasClass(consts.getValue("WRAPPER_CSS_CLASS"))) {
				removeContainer();
				removeWrapper();
			} 
			
			createWrapper();
			createContainer();	

			$container = jQuery("#" + getContainerId());
			if (config.get("placeholder")) {
				$field.attr("placeholder", config.get("placeholder"));
			}


			function createWrapper() {
				var $wrapper = jQuery("<div>"),
					classes = consts.getValue("WRAPPER_CSS_CLASS");

			
				if (config.get("theme") && config.get("theme") !== "") {
					classes += " eac-" + config.get("theme");
				}

				if (config.get("cssClasses") && config.get("cssClasses") !== "") {
					classes += " " + config.get("cssClasses");
				}

				if (template.getTemplateClass() !== "") {
					classes += " " + template.getTemplateClass();
				}
				

				$wrapper
					.addClass(classes);
				$field.wrap($wrapper);


				if (config.get("adjustWidth") === true) {
					adjustWrapperWidth();	
				}
				

			}

			function adjustWrapperWidth() {
				var fieldWidth = $field.outerWidth();

				$field.parent().css("width", fieldWidth);				
			}

			function removeWrapper() {
				$field.unwrap();
			}

			function createContainer() {
				var $elements_container = jQuery("<div>").addClass(consts.getValue("CONTAINER_CLASS"));

				$elements_container
						.attr("id", getContainerId())
						.prepend(jQuery("<ul>"));


				(function() {

					$elements_container
						/* List show animation */
						.on("show.eac", function() {

							switch(config.get("list").showAnimation.type) {

								case "slide":
									var animationTime = config.get("list").showAnimation.time,
										callback = config.get("list").showAnimation.callback;

									$elements_container.find("ul").slideDown(animationTime, callback);
								break;

								case "fade":
									var animationTime = config.get("list").showAnimation.time,
										callback = config.get("list").showAnimation.callback;

									$elements_container.find("ul").fadeIn(animationTime), callback;
								break;

								default:
									$elements_container.find("ul").show();
								break;
							}

							config.get("list").onShowListEvent();
							
						})
						/* List hide animation */
						.on("hide.eac", function() {

							switch(config.get("list").hideAnimation.type) {

								case "slide":
									var animationTime = config.get("list").hideAnimation.time,
										callback = config.get("list").hideAnimation.callback;

									$elements_container.find("ul").slideUp(animationTime, callback);
								break;

								case "fade":
									var animationTime = config.get("list").hideAnimation.time,
										callback = config.get("list").hideAnimation.callback;

									$elements_container.find("ul").fadeOut(animationTime, callback);
								break;

								default:
									$elements_container.find("ul").hide();
								break;
							}

							config.get("list").onHideListEvent();

						})
						.on("selectElement.eac", function() {
							$elements_container.find("ul li").removeClass("selected");
							$elements_container.find("ul li").eq(selectedElement).addClass("selected");

							config.get("list").onSelectItemEvent();
						})
						.on("loadElements.eac", function(event, listBuilders, phrase) {
			

							var $item = "",
								$listContainer = $elements_container.find("ul");

							$listContainer
								.empty()
								.detach();

							elementsList = [];
							var counter = 0;
							for(var builderIndex = 0, listBuildersLength = listBuilders.length; builderIndex < listBuildersLength; builderIndex += 1) {

								var listData = listBuilders[builderIndex].data;

								if (listData.length === 0) {
									continue;
								}

								if (listBuilders[builderIndex].header !== undefined && listBuilders[builderIndex].header.length > 0) {
									$listContainer.append("<div class='eac-category' >" + listBuilders[builderIndex].header + "</div>");
								}

								for(var i = 0, listDataLength = listData.length; i < listDataLength && counter < listBuilders[builderIndex].maxListSize; i += 1) {
									$item = jQuery("<li><div class='eac-item'></div></li>");
									

									(function() {
										var j = i,
											itemCounter = counter,
											elementsValue = listBuilders[builderIndex].getValue(listData[j]);

										$item.find(" > div")
											.on("click", function() {

												$field.val(elementsValue).trigger("change");

												selectedElement = itemCounter;
												selectElement(itemCounter);

												config.get("list").onClickEvent();
												config.get("list").onChooseEvent();
											})
											.mouseover(function() {

												selectedElement = itemCounter;
												selectElement(itemCounter);	

												config.get("list").onMouseOverEvent();
											})
											.mouseout(function() {
												config.get("list").onMouseOutEvent();
											})
											.html(template.build(highlight(elementsValue, phrase), listData[j]));
									})();

									$listContainer.append($item);
									elementsList.push(listData[i]);
									counter += 1;
								}
							}

							$elements_container.append($listContainer);

							config.get("list").onLoadEvent();
						});

				})();

				$field.after($elements_container);
			}

			function removeContainer() {
				$field.next("." + consts.getValue("CONTAINER_CLASS")).remove();
			}

			function highlight(string, phrase) {

				if(config.get("highlightPhrase") && phrase !== "") {
					return highlightPhrase(string, phrase);	
				} else {
					return string;
				}
					
			}

			function escapeRegExp(str) {
				return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
 			}

			function highlightPhrase(string, phrase) {
				var escapedPhrase = escapeRegExp(phrase);
				return (string + "").replace(new RegExp("(" + escapedPhrase + ")", "gi") , "<b>$1</b>");
			}



		}
		function getContainerId() {
			
			var elementId = $field.attr("id");

			elementId = consts.getValue("CONTAINER_ID") + elementId;

			return elementId;
		}
		function bindEvents() {

			bindAllEvents();
			

			function bindAllEvents() {
				if (checkParam("autocompleteOff", true)) {
					removeAutocomplete();
				}

				bindFocusOut();
				bindKeyup();
				bindKeydown();
				bindKeypress();
				bindFocus();
				bindBlur();
			}

			function bindFocusOut() {
				$field.focusout(function () {

					var fieldValue = $field.val(),
						phrase;

					if (!config.get("list").match.caseSensitive) {
						fieldValue = fieldValue.toLowerCase();
					}

					for (var i = 0, length = elementsList.length; i < length; i += 1) {

						phrase = config.get("getValue")(elementsList[i]);
						if (!config.get("list").match.caseSensitive) {
							phrase = phrase.toLowerCase();
						}

						if (phrase === fieldValue) {
							selectedElement = i;
							selectElement(selectedElement);
							return;
						}
					}
				});
			}

			function bindKeyup() {
				$field
				.off("keyup")
				.keyup(function(event) {

					switch(event.keyCode) {

						case 27:

							hideContainer();
							loseFieldFocus();
						break;

						case 38:

							event.preventDefault();

							if(elementsList.length > 0 && selectedElement > 0) {

								selectedElement -= 1;

								$field.val(config.get("getValue")(elementsList[selectedElement]));

								selectElement(selectedElement);

							}						
						break;

						case 40:

							event.preventDefault();

							if(elementsList.length > 0 && selectedElement < elementsList.length - 1) {

								selectedElement += 1;

								$field.val(config.get("getValue")(elementsList[selectedElement]));

								selectElement(selectedElement);
								
							}

						break;

						default:

							if (event.keyCode > 40 || event.keyCode === 8) {

								var inputPhrase = $field.val();

								if (!(config.get("list").hideOnEmptyPhrase === true && event.keyCode === 8 && inputPhrase === "")) {

									if (config.get("requestDelay") > 0) {
										if (requestDelayTimeoutId !== undefined) {
											clearTimeout(requestDelayTimeoutId);
										}

										requestDelayTimeoutId = setTimeout(function () { loadData(inputPhrase);}, config.get("requestDelay"));
									} else {
										loadData(inputPhrase);
									}

								} else {
									hideContainer();
								}
								
							}


						break;
					}
				

					function loadData(inputPhrase) {


						if (inputPhrase.length < config.get("minCharNumber")) {
							return;
						}


						if (config.get("data") !== "list-required") {

							var data = config.get("data");

							var listBuilders = listBuilderService.init(data);

							listBuilders = listBuilderService.updateCategories(listBuilders, data);
							
							listBuilders = listBuilderService.processData(listBuilders, inputPhrase);

							loadElements(listBuilders, inputPhrase);

							if ($field.parent().find("li").length > 0) {
								showContainer();	
							} else {
								hideContainer();
							}

						}

						var settings = createAjaxSettings();

						if (settings.url === undefined || settings.url === "") {
							settings.url = config.get("url");
						}

						if (settings.dataType === undefined || settings.dataType === "") {
							settings.dataType = config.get("dataType");
						}


						if (settings.url !== undefined && settings.url !== "list-required") {

							settings.url = settings.url(inputPhrase);
							settings.data = config.get("preparePostData")(settings.data, inputPhrase);

							jQuery.ajax(settings) 
								.done(function(data) {

									var listBuilders = listBuilderService.init(data);

									listBuilders = listBuilderService.updateCategories(listBuilders, data);
									
									listBuilders = listBuilderService.convertXml(listBuilders);
									if (checkInputPhraseMatchResponse(inputPhrase, data)) {

										listBuilders = listBuilderService.processData(listBuilders, inputPhrase);

										loadElements(listBuilders, inputPhrase);	
																				
									}

									if (listBuilderService.checkIfDataExists(listBuilders) && $field.parent().find("li").length > 0) {
										showContainer();	
									} else {
										hideContainer();
									}

									config.get("ajaxCallback")();

								})
								.fail(function() {
									logger.warning("Fail to load response data");
								})
								.always(function() {

								});
						}

						

						function createAjaxSettings() {

							var settings = {},
								ajaxSettings = config.get("ajaxSettings") || {};

							for (var set in ajaxSettings) {
								settings[set] = ajaxSettings[set];
							}

							return settings;
						}

						function checkInputPhraseMatchResponse(inputPhrase, data) {

							if (config.get("matchResponseProperty") !== false) {
								if (typeof config.get("matchResponseProperty") === "string") {
									return (data[config.get("matchResponseProperty")] === inputPhrase);
								}

								if (typeof config.get("matchResponseProperty") === "function") {
									return (config.get("matchResponseProperty")(data) === inputPhrase);
								}

								return true;
							} else {
								return true;
							}

						}

					}


				});
			}

			function bindKeydown() {
				$field
					.on("keydown", function(evt) {
	        		    evt = evt || window.event;
	        		    var keyCode = evt.keyCode;
	        		    if (keyCode === 38) {
	        		        suppressKeypress = true; 
	        		        return false;
	        		    }
		        	})
					.keydown(function(event) {

						if (event.keyCode === 13 && selectedElement > -1) {

							$field.val(config.get("getValue")(elementsList[selectedElement]));

							config.get("list").onKeyEnterEvent();
							config.get("list").onChooseEvent();

							selectedElement = -1;
							hideContainer();

							event.preventDefault();
						}
					});
			}

			function bindKeypress() {
				$field
				.off("keypress");
			}

			function bindFocus() {
				$field.focus(function() {

					if ($field.val() !== "" && elementsList.length > 0) {
						
						selectedElement = -1;
						showContainer();	
					}
									
				});
			}

			function bindBlur() {
				$field.blur(function() {
					setTimeout(function() { 
						
						selectedElement = -1;
						hideContainer();
					}, 250);
				});
			}

			function removeAutocomplete() {
				$field.attr("autocomplete","off");
			}

		}

		function showContainer() {
			$container.trigger("show.eac");
		}

		function hideContainer() {
			$container.trigger("hide.eac");
		}

		function selectElement(index) {
			
			$container.trigger("selectElement.eac", index);
		}

		function loadElements(list, phrase) {
			$container.trigger("loadElements.eac", [list, phrase]);
		}

		function loseFieldFocus() {
			$field.trigger("blur");
		}


	};
	scope.eacHandles = [];

	scope.getHandle = function(id) {
		return scope.eacHandles[id];
	};

	scope.inputHasId = function(input) {

		if(jQuery(input).attr("id") !== undefined && jQuery(input).attr("id").length > 0) {
			return true;
		} else {
			return false;
		}

	};

	scope.assignRandomId = function(input) {

		var fieldId = "";

		do {
			fieldId = "eac-" + Math.floor(Math.random() * 10000);		
		} while (jQuery("#" + fieldId).length !== 0);
		
		elementId = scope.consts.getValue("CONTAINER_ID") + fieldId;

		jQuery(input).attr("id", fieldId);
 
	};

	scope.setHandle = function(handle, id) {
		scope.eacHandles[id] = handle;
	};


	return scope;

})(EasyAutocomplete || {});

(function($) {

	$.fn.easyAutocomplete = function(options) {

		return this.each(function() {
			var $this = $(this),
				eacHandle = new EasyAutocomplete.main($this, options);

			if (!EasyAutocomplete.inputHasId($this)) {
				EasyAutocomplete.assignRandomId($this);
			}

			eacHandle.init();

			EasyAutocomplete.setHandle(eacHandle, $this.attr("id"));

		});
	};

	$.fn.getSelectedItemIndex = function() {

		var inputId = $(this).attr("id");

		if (inputId !== undefined) {
			return EasyAutocomplete.getHandle(inputId).getSelectedItemIndex();
		}

		return -1;
	};

	$.fn.getItems = function () {

		var inputId = $(this).attr("id");

		if (inputId !== undefined) {
			return EasyAutocomplete.getHandle(inputId).getItems();
		}

		return -1;
	};

	$.fn.getItemData = function(index) {

		var inputId = $(this).attr("id");

		if (inputId !== undefined && index > -1) {
			return EasyAutocomplete.getHandle(inputId).getItemData(index);
		}

		return -1;
	};

	$.fn.getSelectedItemData = function() {

		var inputId = $(this).attr("id");

		if (inputId !== undefined) {
			return EasyAutocomplete.getHandle(inputId).getSelectedItemData();
		}

		return -1;
	};

})(jQuery);
;
(function ($, Drupal) {
  Drupal.behaviors.touringapi = {
    attach: function (context, settings) {

      var selectedObj = [];

      function load_artists(genre,offset){
        $('body').addClass('loading-scene');

        var url = '/touring/artists/'+genre+'/'+offset;

        var genre_list = genre.split(',');

        $('a.genrenav-item').removeClass('active');

        $(".genre-list li").remove();

        for (var i = 0; i < genre_list.length; i++) {
          $('.genrenav-item[data="'+genre_list[i]+'"]').addClass('active');
          $(".genre-list").append('<li>'+genre_list[i]+'. </li>');
        }

        $.get( url, function( data ) {
          var art_data = $.parseJSON(data);

          $("#artist_wrapper", context).fadeOut('slow',function(){
            $(this).html(art_data.artist_grid);
          }).fadeIn("slow");
          window.AOS.init();
          $('body').removeClass('loading-scene');
        });
      }

      function load_artists_paginate(genre,offset,prev_alpha){
        var url = '/touring/artists_page/'+genre+'/'+offset+'/'+prev_alpha;
        $('body').addClass('loading-scene');
        $.get( url, function( data ) {
          var art_data = $.parseJSON(data);
          $("#artist_wrapper").append(art_data.artist_grid);
          $('body').removeClass('loading-scene');
        });
      }

      $('body').on('click','.download-icon',function(e){
        e.preventDefault();
        window.print();
      });

      $(document).ready(function () {
        //load all artists in the DOM
        var hash = window.location.hash, genre, offsets = 1;
        if (hash !== '') {
          genre = hash.replace('#','');
        }else{
          genre = 'all';
        }

        var genre_load = genre.split(',');
        $(".genre-list li").remove();

        for (var i = 0; i < genre_load.length; i++) {
          selectedObj.push(genre_load[i]);
          $(".genre-list").append('<li>'+genre_load[i]+'. </li>');
        }

        load_artists(genre,0);

        var options = {
          placeholder: "Search for an artist by name",
          url: function(phrase) {
            return "/v1/touingcaa/searchArtist/" + phrase;
          },
          getValue: "label",
          list: {
            showAnimation: {
              type: "fade", //normal|slide|fade
              time: 400,
              callback: function() {}
            },
            hideAnimation: {
              type: "slide", //normal|slide|fade
              time: 400,
              callback: function() {}
            },
            onClickEvent: function() {
              navigateToArtistPage();
            },
            onChooseEvent: function() {
              navigateToArtistPage();
            }
          }
        };

        function navigateToArtistPage() {
          var value = $("#artistsearch").getSelectedItemData().value;
          window.location = "/entertainmenttalent/touring/artist/"+value;
        }

        $( "#artistsearch" ).easyAutocomplete(options);

        $('body').on('click','.genrenav-item',function(){

          $('body').addClass('loading-scene');

          var selected = $(this).attr('data');

          if(selectedObj.indexOf(selected) != -1){
            $(".genre-list li").eq(selectedObj.indexOf(selected)).remove();
            selectedObj.splice(selectedObj.indexOf(selected),1);
          } else {
            selectedObj.push(selected);
          }

          if(selected === 'all'){
            $('a.genrenav-item').removeClass('active');
            selectedObj =['all'];
          } else if(selectedObj.indexOf('all') != -1) {
            selectedObj.splice(selectedObj.indexOf('all'),1);
          }

          window.location.hash = selectedObj.join(',');

          var selected_list = selectedObj.join(',') || 'all'; // is array of selected genres to pass in

          offsets = 1;

          load_artists(selected_list);

        });

        $('body').on('click','.js-select',function(){
          if(selectedObj.length >= 4){
            alert('Please select only up to 5 Professionals');
            return;
          }
          $(this).parent().toggleClass('selected');
        });

        $('.touring-categories').on('change',function(){
          var genre = $(this).val();
          $('body').addClass('loading-scene');
          window.location.hash = genre;
          load_artists(genre,0);
        });


        $(".inquiry-link").click(function(){
          load_inquiry_form('general_touring_inquiry_form');
        });

        //endless scroll
        $(window).bind('scroll', function() {

          if($(window).scrollTop() >= (($('.block-touring-api').offset().top + $('.block-touring-api').outerHeight(true) )- (window.innerHeight+800) )) {
            if( $('body').find('.paginate').length ){
              var genre = $('body').find('.paginate').attr('data-genre');
              var offset;

              if($.isNumeric($('body').find('.paginate').attr('data-offset'))){
                offset = $('body').find('.paginate').attr('data-offset');
              } else {
                offset = offsets;
              }

              var prev_alpha = $('body').find('.paginate').attr('data-prev_alpha');

              window.location.hash = genre;

              load_artists_paginate(genre,offset,prev_alpha);

              offsets += 1;

              $('body').find('.paginate').detach();
            }else{
              // console.log('end of last page');
            }
          }
        });

      });
    }
  };
})(jQuery, Drupal);
;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

Drupal.debounce = function (func, wait, immediate) {
  var timeout = void 0;
  var result = void 0;
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var context = this;
    var later = function later() {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
      }
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
    }
    return result;
  };
};;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal, debounce) {
  $.fn.drupalGetSummary = function () {
    var callback = this.data('summaryCallback');
    return this[0] && callback ? $.trim(callback(this[0])) : '';
  };

  $.fn.drupalSetSummary = function (callback) {
    var self = this;

    if (typeof callback !== 'function') {
      var val = callback;
      callback = function callback() {
        return val;
      };
    }

    return this.data('summaryCallback', callback).off('formUpdated.summary').on('formUpdated.summary', function () {
      self.trigger('summaryUpdated');
    }).trigger('summaryUpdated');
  };

  Drupal.behaviors.formSingleSubmit = {
    attach: function attach() {
      function onFormSubmit(e) {
        var $form = $(e.currentTarget);
        var formValues = $form.serialize();
        var previousValues = $form.attr('data-drupal-form-submit-last');
        if (previousValues === formValues) {
          e.preventDefault();
        } else {
          $form.attr('data-drupal-form-submit-last', formValues);
        }
      }

      $('body').once('form-single-submit').on('submit.singleSubmit', 'form:not([method~="GET"])', onFormSubmit);
    }
  };

  function triggerFormUpdated(element) {
    $(element).trigger('formUpdated');
  }

  function fieldsList(form) {
    var $fieldList = $(form).find('[name]').map(function (index, element) {
      return element.getAttribute('id');
    });

    return $.makeArray($fieldList);
  }

  Drupal.behaviors.formUpdated = {
    attach: function attach(context) {
      var $context = $(context);
      var contextIsForm = $context.is('form');
      var $forms = (contextIsForm ? $context : $context.find('form')).once('form-updated');
      var formFields = void 0;

      if ($forms.length) {
        $.makeArray($forms).forEach(function (form) {
          var events = 'change.formUpdated input.formUpdated ';
          var eventHandler = debounce(function (event) {
            triggerFormUpdated(event.target);
          }, 300);
          formFields = fieldsList(form).join(',');

          form.setAttribute('data-drupal-form-fields', formFields);
          $(form).on(events, eventHandler);
        });
      }

      if (contextIsForm) {
        formFields = fieldsList(context).join(',');

        var currentFields = $(context).attr('data-drupal-form-fields');

        if (formFields !== currentFields) {
          triggerFormUpdated(context);
        }
      }
    },
    detach: function detach(context, settings, trigger) {
      var $context = $(context);
      var contextIsForm = $context.is('form');
      if (trigger === 'unload') {
        var $forms = (contextIsForm ? $context : $context.find('form')).removeOnce('form-updated');
        if ($forms.length) {
          $.makeArray($forms).forEach(function (form) {
            form.removeAttribute('data-drupal-form-fields');
            $(form).off('.formUpdated');
          });
        }
      }
    }
  };

  Drupal.behaviors.fillUserInfoFromBrowser = {
    attach: function attach(context, settings) {
      var userInfo = ['name', 'mail', 'homepage'];
      var $forms = $('[data-user-info-from-browser]').once('user-info-from-browser');
      if ($forms.length) {
        userInfo.forEach(function (info) {
          var $element = $forms.find('[name=' + info + ']');
          var browserData = localStorage.getItem('Drupal.visitor.' + info);
          var emptyOrDefault = $element.val() === '' || $element.attr('data-drupal-default-value') === $element.val();
          if ($element.length && emptyOrDefault && browserData) {
            $element.val(browserData);
          }
        });
      }
      $forms.on('submit', function () {
        userInfo.forEach(function (info) {
          var $element = $forms.find('[name=' + info + ']');
          if ($element.length) {
            localStorage.setItem('Drupal.visitor.' + info, $element.val());
          }
        });
      });
    }
  };

  var handleFragmentLinkClickOrHashChange = function handleFragmentLinkClickOrHashChange(e) {
    var url = void 0;
    if (e.type === 'click') {
      url = e.currentTarget.location ? e.currentTarget.location : e.currentTarget;
    } else {
      url = window.location;
    }
    var hash = url.hash.substr(1);
    if (hash) {
      var $target = $('#' + hash);
      $('body').trigger('formFragmentLinkClickOrHashChange', [$target]);

      setTimeout(function () {
        return $target.trigger('focus');
      }, 300);
    }
  };

  var debouncedHandleFragmentLinkClickOrHashChange = debounce(handleFragmentLinkClickOrHashChange, 300, true);

  $(window).on('hashchange.form-fragment', debouncedHandleFragmentLinkClickOrHashChange);

  $(document).on('click.form-fragment', 'a[href*="#"]', debouncedHandleFragmentLinkClickOrHashChange);
})(jQuery, Drupal, Drupal.debounce);;
/**
 * @file
 * Webform behaviors.
 */

(function ($, Drupal) {

  'use strict';

  // Trigger Drupal's attaching of behaviors after the page is
  // completely loaded.
  // @see https://stackoverflow.com/questions/37838430/detect-if-page-is-load-from-back-button
  // @see https://stackoverflow.com/questions/20899274/how-to-refresh-page-on-back-button-click/20899422#20899422
  var isChrome = (/chrom(e|ium)/.test(window.navigator.userAgent.toLowerCase()));
  if (isChrome) {
    // Track back button in navigation.
    // @see https://stackoverflow.com/questions/37838430/detect-if-page-is-load-from-back-button
    var backButton = false;
    if (window.performance) {
      var navEntries = window.performance.getEntriesByType('navigation');
      if (navEntries.length > 0 && navEntries[0].type === 'back_forward') {
        backButton = true;
      }
      else if (window.performance.navigation
        && window.performance.navigation.type === window.performance.navigation.TYPE_BACK_FORWARD) {
        backButton = true;
      }
    }

    // If the back button is pressed, delay Drupal's attaching of behaviors.
    if (backButton) {
      var attachBehaviors = Drupal.attachBehaviors;
      Drupal.attachBehaviors = function (context, settings) {
        setTimeout(function (context, settings) {
          attachBehaviors(context, settings);
        }, 300);
      };
    }
  }

})(jQuery, Drupal);
;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal) {
  var states = {
    postponed: []
  };

  Drupal.states = states;

  function invert(a, invertState) {
    return invertState && typeof a !== 'undefined' ? !a : a;
  }

  function _compare2(a, b) {
    if (a === b) {
      return typeof a === 'undefined' ? a : true;
    }

    return typeof a === 'undefined' || typeof b === 'undefined';
  }

  function ternary(a, b) {
    if (typeof a === 'undefined') {
      return b;
    }
    if (typeof b === 'undefined') {
      return a;
    }

    return a && b;
  }

  Drupal.behaviors.states = {
    attach: function attach(context, settings) {
      var $states = $(context).find('[data-drupal-states]');
      var il = $states.length;

      var _loop = function _loop(i) {
        var config = JSON.parse($states[i].getAttribute('data-drupal-states'));
        Object.keys(config || {}).forEach(function (state) {
          new states.Dependent({
            element: $($states[i]),
            state: states.State.sanitize(state),
            constraints: config[state]
          });
        });
      };

      for (var i = 0; i < il; i++) {
        _loop(i);
      }

      while (states.postponed.length) {
        states.postponed.shift()();
      }
    }
  };

  states.Dependent = function (args) {
    var _this = this;

    $.extend(this, { values: {}, oldValue: null }, args);

    this.dependees = this.getDependees();
    Object.keys(this.dependees || {}).forEach(function (selector) {
      _this.initializeDependee(selector, _this.dependees[selector]);
    });
  };

  states.Dependent.comparisons = {
    RegExp: function RegExp(reference, value) {
      return reference.test(value);
    },
    Function: function Function(reference, value) {
      return reference(value);
    },
    Number: function Number(reference, value) {
      return typeof value === 'string' ? _compare2(reference.toString(), value) : _compare2(reference, value);
    }
  };

  states.Dependent.prototype = {
    initializeDependee: function initializeDependee(selector, dependeeStates) {
      var _this2 = this;

      this.values[selector] = {};

      Object.keys(dependeeStates).forEach(function (i) {
        var state = dependeeStates[i];

        if ($.inArray(state, dependeeStates) === -1) {
          return;
        }

        state = states.State.sanitize(state);

        _this2.values[selector][state.name] = null;

        $(selector).on('state:' + state, { selector: selector, state: state }, function (e) {
          _this2.update(e.data.selector, e.data.state, e.value);
        });

        new states.Trigger({ selector: selector, state: state });
      });
    },
    compare: function compare(reference, selector, state) {
      var value = this.values[selector][state.name];
      if (reference.constructor.name in states.Dependent.comparisons) {
        return states.Dependent.comparisons[reference.constructor.name](reference, value);
      }

      return _compare2(reference, value);
    },
    update: function update(selector, state, value) {
      if (value !== this.values[selector][state.name]) {
        this.values[selector][state.name] = value;
        this.reevaluate();
      }
    },
    reevaluate: function reevaluate() {
      var value = this.verifyConstraints(this.constraints);

      if (value !== this.oldValue) {
        this.oldValue = value;

        value = invert(value, this.state.invert);

        this.element.trigger({
          type: 'state:' + this.state,
          value: value,
          trigger: true
        });
      }
    },
    verifyConstraints: function verifyConstraints(constraints, selector) {
      var result = void 0;
      if ($.isArray(constraints)) {
        var hasXor = $.inArray('xor', constraints) === -1;
        var len = constraints.length;
        for (var i = 0; i < len; i++) {
          if (constraints[i] !== 'xor') {
            var constraint = this.checkConstraints(constraints[i], selector, i);

            if (constraint && (hasXor || result)) {
              return hasXor;
            }
            result = result || constraint;
          }
        }
      } else if ($.isPlainObject(constraints)) {
          for (var n in constraints) {
            if (constraints.hasOwnProperty(n)) {
              result = ternary(result, this.checkConstraints(constraints[n], selector, n));

              if (result === false) {
                return false;
              }
            }
          }
        }
      return result;
    },
    checkConstraints: function checkConstraints(value, selector, state) {
      if (typeof state !== 'string' || /[0-9]/.test(state[0])) {
        state = null;
      } else if (typeof selector === 'undefined') {
        selector = state;
        state = null;
      }

      if (state !== null) {
        state = states.State.sanitize(state);
        return invert(this.compare(value, selector, state), state.invert);
      }

      return this.verifyConstraints(value, selector);
    },
    getDependees: function getDependees() {
      var cache = {};

      var _compare = this.compare;
      this.compare = function (reference, selector, state) {
        (cache[selector] || (cache[selector] = [])).push(state.name);
      };

      this.verifyConstraints(this.constraints);

      this.compare = _compare;

      return cache;
    }
  };

  states.Trigger = function (args) {
    $.extend(this, args);

    if (this.state in states.Trigger.states) {
      this.element = $(this.selector);

      if (!this.element.data('trigger:' + this.state)) {
        this.initialize();
      }
    }
  };

  states.Trigger.prototype = {
    initialize: function initialize() {
      var _this3 = this;

      var trigger = states.Trigger.states[this.state];

      if (typeof trigger === 'function') {
        trigger.call(window, this.element);
      } else {
        Object.keys(trigger || {}).forEach(function (event) {
          _this3.defaultTrigger(event, trigger[event]);
        });
      }

      this.element.data('trigger:' + this.state, true);
    },
    defaultTrigger: function defaultTrigger(event, valueFn) {
      var oldValue = valueFn.call(this.element);

      this.element.on(event, $.proxy(function (e) {
        var value = valueFn.call(this.element, e);

        if (oldValue !== value) {
          this.element.trigger({
            type: 'state:' + this.state,
            value: value,
            oldValue: oldValue
          });
          oldValue = value;
        }
      }, this));

      states.postponed.push($.proxy(function () {
        this.element.trigger({
          type: 'state:' + this.state,
          value: oldValue,
          oldValue: null
        });
      }, this));
    }
  };

  states.Trigger.states = {
    empty: {
      keyup: function keyup() {
        return this.val() === '';
      }
    },

    checked: {
      change: function change() {
        var checked = false;
        this.each(function () {
          checked = $(this).prop('checked');

          return !checked;
        });
        return checked;
      }
    },

    value: {
      keyup: function keyup() {
        if (this.length > 1) {
          return this.filter(':checked').val() || false;
        }
        return this.val();
      },
      change: function change() {
        if (this.length > 1) {
          return this.filter(':checked').val() || false;
        }
        return this.val();
      }
    },

    collapsed: {
      collapsed: function collapsed(e) {
        return typeof e !== 'undefined' && 'value' in e ? e.value : !this.is('[open]');
      }
    }
  };

  states.State = function (state) {
    this.pristine = state;
    this.name = state;

    var process = true;
    do {
      while (this.name.charAt(0) === '!') {
        this.name = this.name.substring(1);
        this.invert = !this.invert;
      }

      if (this.name in states.State.aliases) {
        this.name = states.State.aliases[this.name];
      } else {
        process = false;
      }
    } while (process);
  };

  states.State.sanitize = function (state) {
    if (state instanceof states.State) {
      return state;
    }

    return new states.State(state);
  };

  states.State.aliases = {
    enabled: '!disabled',
    invisible: '!visible',
    invalid: '!valid',
    untouched: '!touched',
    optional: '!required',
    filled: '!empty',
    unchecked: '!checked',
    irrelevant: '!relevant',
    expanded: '!collapsed',
    open: '!collapsed',
    closed: 'collapsed',
    readwrite: '!readonly'
  };

  states.State.prototype = {
    invert: false,

    toString: function toString() {
      return this.name;
    }
  };

  var $document = $(document);
  $document.on('state:disabled', function (e) {
    if (e.trigger) {
      $(e.target).prop('disabled', e.value).closest('.js-form-item, .js-form-submit, .js-form-wrapper').toggleClass('form-disabled', e.value).find('select, input, textarea').prop('disabled', e.value);
    }
  });

  $document.on('state:required', function (e) {
    if (e.trigger) {
      if (e.value) {
        var label = 'label' + (e.target.id ? '[for=' + e.target.id + ']' : '');
        var $label = $(e.target).attr({ required: 'required', 'aria-required': 'true' }).closest('.js-form-item, .js-form-wrapper').find(label);

        if (!$label.hasClass('js-form-required').length) {
          $label.addClass('js-form-required form-required');
        }
      } else {
        $(e.target).removeAttr('required aria-required').closest('.js-form-item, .js-form-wrapper').find('label.js-form-required').removeClass('js-form-required form-required');
      }
    }
  });

  $document.on('state:visible', function (e) {
    if (e.trigger) {
      $(e.target).closest('.js-form-item, .js-form-submit, .js-form-wrapper').toggle(e.value);
    }
  });

  $document.on('state:checked', function (e) {
    if (e.trigger) {
      $(e.target).prop('checked', e.value);
    }
  });

  $document.on('state:collapsed', function (e) {
    if (e.trigger) {
      if ($(e.target).is('[open]') === e.value) {
        $(e.target).find('> summary').trigger('click');
      }
    }
  });
})(jQuery, Drupal);;
/**
 * @file
 * JavaScript behaviors for custom webform #states.
 */

(function ($, Drupal) {

  'use strict';

  Drupal.webform = Drupal.webform || {};
  Drupal.webform.states = Drupal.webform.states || {};
  Drupal.webform.states.slideDown = Drupal.webform.states.slideDown || {};
  Drupal.webform.states.slideDown.duration = 'slow';
  Drupal.webform.states.slideUp = Drupal.webform.states.slideUp || {};
  Drupal.webform.states.slideUp.duration = 'fast';

  /* ************************************************************************ */
  // jQuery functions.
  /* ************************************************************************ */

  /**
   * Check if an element has a specified data attribute.
   *
   * @param {string} data
   *   The data attribute name.
   *
   * @return {boolean}
   *   TRUE if an element has a specified data attribute.
   */
  $.fn.hasData = function (data) {
    return (typeof this.data(data) !== 'undefined');
  };

  /**
   * Check if element is within the webform or not.
   *
   * @return {boolean}
   *   TRUE if element is within the webform.
   */
  $.fn.isWebform = function () {
    return $(this).closest('form.webform-submission-form, form[id^="webform"], form[data-is-webform]').length ? true : false;
  };

  /**
   * Check if element is to be treated as a webform element.
   *
   * @return {boolean}
   *   TRUE if element is to be treated as a webform element.
   */
  $.fn.isWebformElement = function () {
    return ($(this).isWebform() || $(this).closest('[data-is-webform-element]').length) ? true : false;
  };

  /* ************************************************************************ */
  // Trigger.
  /* ************************************************************************ */

  // The change event is triggered by cut-n-paste and select menus.
  // Issue #2445271: #states element empty check not triggered on mouse
  // based paste.
  // @see https://www.drupal.org/node/2445271
  Drupal.states.Trigger.states.empty.change = function change() {
    return this.val() === '';
  };

  /* ************************************************************************ */
  // Dependents.
  /* ************************************************************************ */


  // Apply solution included in #1962800 patch.
  // Issue #1962800: Form #states not working with literal integers as
  // values in IE11.
  // @see https://www.drupal.org/project/drupal/issues/1962800
  // @see https://www.drupal.org/files/issues/core-states-not-working-with-integers-ie11_1962800_46.patch
  //
  // This issue causes pattern, less than, and greater than support to break.
  // @see https://www.drupal.org/project/webform/issues/2981724
  var states = Drupal.states;
  Drupal.states.Dependent.prototype.compare = function compare(reference, selector, state) {
    var value = this.values[selector][state.name];

    var name = reference.constructor.name;
    if (!name) {
      name = $.type(reference);

      name = name.charAt(0).toUpperCase() + name.slice(1);
    }
    if (name in states.Dependent.comparisons) {
      return states.Dependent.comparisons[name](reference, value);
    }

    if (reference.constructor.name in states.Dependent.comparisons) {
      return states.Dependent.comparisons[reference.constructor.name](reference, value);
    }

    return _compare2(reference, value);
  };
  function _compare2(a, b) {
    if (a === b) {
      return typeof a === 'undefined' ? a : true;
    }

    return typeof a === 'undefined' || typeof b === 'undefined';
  }

  // Adds pattern, less than, and greater than support to #state API.
  // @see http://drupalsun.com/julia-evans/2012/03/09/extending-form-api-states-regular-expressions
  Drupal.states.Dependent.comparisons.Object = function (reference, value) {
    if ('pattern' in reference) {
      return (new RegExp(reference['pattern'])).test(value);
    }
    else if ('!pattern' in reference) {
      return !((new RegExp(reference['!pattern'])).test(value));
    }
    else if ('less' in reference) {
      return (value !== '' && parseFloat(reference['less']) > parseFloat(value));
    }
    else if ('less_equal' in reference) {
      return (value !== '' && parseFloat(reference['less_equal']) >= parseFloat(value));
    }
    else if ('greater' in reference) {
      return (value !== '' && parseFloat(reference['greater']) < parseFloat(value));
    }
    else if ('greater_equal' in reference) {
      return (value !== '' && parseFloat(reference['greater_equal']) <= parseFloat(value));
    }
    else if ('between' in reference || '!between' in reference) {
      if (value === '') {
        return false;
      }

      var between = reference['between'] || reference['!between'];
      var betweenParts = between.split(':');
      var greater = betweenParts[0];
      var less = (typeof betweenParts[1] !== 'undefined') ? betweenParts[1] : null;
      var isGreaterThan = (greater === null || greater === '' || parseFloat(value) >= parseFloat(greater));
      var isLessThan = (less === null || less === '' || parseFloat(value) <= parseFloat(less));
      var result = (isGreaterThan && isLessThan);
      return (reference['!between']) ? !result : result;
    }
    else {
      return reference.indexOf(value) !== false;
    }
  };

  /* ************************************************************************ */
  // States events.
  /* ************************************************************************ */

  var $document = $(document);

  $document.on('state:required', function (e) {
    if (e.trigger && $(e.target).isWebformElement()) {
      var $target = $(e.target);
      // Fix #required file upload.
      // @see Issue #2860529: Conditional required File upload field don't work.
      toggleRequired($target.find('input[type="file"]'), e.value);

      // Fix #required for radios and likert.
      // @see Issue #2856795: If radio buttons are required but not filled form is nevertheless submitted.
      if ($target.is('.js-form-type-radios, .js-form-type-webform-radios-other, .js-webform-type-radios, .js-webform-type-webform-radios-other, .js-webform-type-webform-entity-radios, .webform-likert-table')) {
        $target.toggleClass('required', e.value);
        toggleRequired($target.find('input[type="radio"]'), e.value);
      }

      // Fix #required for checkboxes.
      // @see Issue #2938414: Checkboxes don't support #states required.
      // @see checkboxRequiredhandler
      if ($target.is('.js-form-type-checkboxes, .js-form-type-webform-checkboxes-other, .js-webform-type-checkboxes, .js-webform-type-webform-checkboxes-other')) {
        $target.toggleClass('required', e.value);
        var $checkboxes = $target.find('input[type="checkbox"]');
        if (e.value) {
          // Add event handler.
          $checkboxes.on('click', statesCheckboxesRequiredEventHandler);
          // Initialize and add required attribute.
          checkboxesRequired($target);
        }
        else {
          // Remove event handler.
          $checkboxes.off('click', statesCheckboxesRequiredEventHandler);
          // Remove required attribute.
          toggleRequired($checkboxes, false);
        }
      }

      // Fix #required for tableselect.
      // @see Issue #3212581: Table select does not trigger client side validation
      if ($target.is('.js-webform-tableselect')) {
        $target.toggleClass('required', e.value);
        var isMultiple = $target.is('[multiple]');
        if (isMultiple) {
          // Checkboxes.
          var $tbody = $target.find('tbody');
          var $checkboxes = $tbody.find('input[type="checkbox"]');
          copyRequireMessage($target, $checkboxes);
          if (e.value) {
            $checkboxes.on('click change', statesCheckboxesRequiredEventHandler);
            checkboxesRequired($tbody);
          }
          else {
            $checkboxes.off('click change ', statesCheckboxesRequiredEventHandler);
            toggleRequired($tbody, false);
          }
        }
        else {
          // Radios.
          var $radios = $target.find('input[type="radio"]');
          copyRequireMessage($target, $radios);
          toggleRequired($radios, e.value);
        }
      }

      // Fix required label for elements without the for attribute.
      // @see Issue #3145300: Conditional Visible Select Other not working.
      if ($target.is('.js-form-type-webform-select-other, .js-webform-type-webform-select-other')) {
        var $select = $target.find('select');
        toggleRequired($select, e.value);
        copyRequireMessage($target, $select);
      }
      if ($target.find('> label:not([for])').length) {
        $target.find('> label').toggleClass('js-form-required form-required', e.value);
      }

      // Fix required label for checkboxes and radios.
      // @see Issue #2938414: Checkboxes don't support #states required
      // @see Issue #2731991: Setting required on radios marks all options required.
      // @see Issue #2856315: Conditional Logic - Requiring Radios in a Fieldset.
      // Fix #required for fieldsets.
      // @see Issue #2977569: Hidden fieldsets that become visible with conditional logic cannot be made required.
      if ($target.is('.js-webform-type-radios, .js-webform-type-checkboxes, fieldset')) {
        $target.find('legend span.fieldset-legend:not(.visually-hidden)').toggleClass('js-form-required form-required', e.value);
      }

      // Issue #2986017: Fieldsets shouldn't have required attribute.
      if ($target.is('fieldset')) {
        $target.removeAttr('required aria-required');
      }
    }
  });

  $document.on('state:checked', function (e) {
    if (e.trigger) {
      $(e.target).trigger('change');
    }
  });

  $document.on('state:readonly', function (e) {
    if (e.trigger && $(e.target).isWebformElement()) {
      $(e.target).prop('readonly', e.value).closest('.js-form-item, .js-form-wrapper').toggleClass('webform-readonly', e.value).find('input, textarea').prop('readonly', e.value);

      // Trigger webform:readonly.
      $(e.target).trigger('webform:readonly')
        .find('select, input, textarea, button').trigger('webform:readonly');
    }
  });

  $document.on('state:visible state:visible-slide', function (e) {
    if (e.trigger && $(e.target).isWebformElement()) {
      if (e.value) {
        $(':input', e.target).addBack().each(function () {
          restoreValueAndRequired(this);
          triggerEventHandlers(this);
        });
      }
      else {
        // @see https://www.sitepoint.com/jquery-function-clear-form-data/
        $(':input', e.target).addBack().each(function () {
          backupValueAndRequired(this);
          clearValueAndRequired(this);
          triggerEventHandlers(this);
        });
      }
    }
  });

  $document.on('state:visible-slide', function (e) {
    if (e.trigger && $(e.target).isWebformElement()) {
      var effect = e.value ? 'slideDown' : 'slideUp';
      var duration = Drupal.webform.states[effect].duration;
      $(e.target).closest('.js-form-item, .js-form-submit, .js-form-wrapper')[effect](duration);
    }
  });
  Drupal.states.State.aliases['invisible-slide'] = '!visible-slide';

  $document.on('state:disabled', function (e) {
    if (e.trigger && $(e.target).isWebformElement()) {
      // Make sure disabled property is set before triggering webform:disabled.
      // Copied from: core/misc/states.js
      $(e.target)
        .prop('disabled', e.value)
        .closest('.js-form-item, .js-form-submit, .js-form-wrapper').toggleClass('form-disabled', e.value)
        .find('select, input, textarea, button').prop('disabled', e.value);

      // Never disable hidden file[fids] because the existing values will
      // be completely lost when the webform is submitted.
      var fileElements = $(e.target)
        .find(':input[type="hidden"][name$="[fids]"]');
      if (fileElements.length) {
        // Remove 'disabled' attribute from fieldset which will block
        // all disabled elements from being submitted.
        if ($(e.target).is('fieldset')) {
          $(e.target).prop('disabled', false);
        }
        fileElements.removeAttr('disabled');
      }

      // Trigger webform:disabled.
      $(e.target).trigger('webform:disabled')
        .find('select, input, textarea, button').trigger('webform:disabled');
    }
  });

  /* ************************************************************************ */
  // Behaviors.
  /* ************************************************************************ */

  /**
   * Adds HTML5 validation to required checkboxes.
   *
   * @type {Drupal~behavior}
   *
   * @see https://www.drupal.org/project/webform/issues/3068998
   */
  Drupal.behaviors.webformCheckboxesRequired = {
    attach: function (context) {
      $('.js-form-type-checkboxes.required, .js-form-type-webform-checkboxes-other.required, .js-webform-type-checkboxes.required, .js-webform-type-webform-checkboxes-other.required, .js-webform-type-webform-radios-other.checkboxes', context)
        .once('webform-checkboxes-required')
        .each(function () {
          var $element = $(this);
          $element.find('input[type="checkbox"]').on('click', statesCheckboxesRequiredEventHandler);
          setTimeout(function () {checkboxesRequired($element);});
        });
    }
  };

  /**
   * Adds HTML5 validation to required radios.
   *
   * @type {Drupal~behavior}
   *
   * @see https://www.drupal.org/project/webform/issues/2856795
   */
  Drupal.behaviors.webformRadiosRequired = {
    attach: function (context) {
      $('.js-form-type-radios, .js-form-type-webform-radios-other, .js-webform-type-radios, .js-webform-type-webform-radios-other, .js-webform-type-webform-entity-radios, .js-webform-type-webform-scale', context)
        .once('webform-radios-required')
        .each(function () {
          var $element = $(this);
          setTimeout(function () {radiosRequired($element);});
        });
    }
  };

 /**
   * Adds HTML5 validation to required table select.
   *
   * @type {Drupal~behavior}
   *
   * @see https://www.drupal.org/project/webform/issues/2856795
   */
  Drupal.behaviors.webformTableSelectRequired = {
    attach: function (context) {
      $('.js-webform-tableselect.required', context)
        .once('webform-tableselect-required')
        .each(function () {
          var $element = $(this);
          var $tbody = $element.find('tbody');
          var isMultiple = $element.is('[multiple]');

          if (isMultiple) {
            // Check all checkbox triggers checkbox 'change' event on
            // select and deselect all.
            // @see Drupal.tableSelect
            $tbody.find('input[type="checkbox"]').on('click change', function () {
              checkboxesRequired($tbody);
            });
          }

          setTimeout(function () {
            isMultiple ? checkboxesRequired($tbody) : radiosRequired($element);
          });
        });
    }
  };

  /**
   * Add HTML5 multiple checkboxes required validation.
   *
   * @param {jQuery} $element
   *   An jQuery object containing HTML5 radios.
   *
   * @see https://stackoverflow.com/a/37825072/145846
   */
  function checkboxesRequired($element) {
    var $firstCheckbox = $element.find('input[type="checkbox"]').first();
    var isChecked = $element.find('input[type="checkbox"]').is(':checked');
    toggleRequired($firstCheckbox, !isChecked);
    copyRequireMessage($element, $firstCheckbox);
  }

  /**
   * Add HTML5 radios required validation.
   *
   * @param {jQuery} $element
   *   An jQuery object containing HTML5 radios.
   *
   * @see https://www.drupal.org/project/webform/issues/2856795
   */
  function radiosRequired($element) {
    var $radios = $element.find('input[type="radio"]');
    var isRequired = $element.hasClass('required');
    toggleRequired($radios, isRequired);
    copyRequireMessage($element, $radios);
  }

  /* ************************************************************************ */
  // Event handlers.
  /* ************************************************************************ */

  /**
   * Trigger #states API HTML5 multiple checkboxes required validation.
   *
   * @see https://stackoverflow.com/a/37825072/145846
   */
  function statesCheckboxesRequiredEventHandler() {
    var $element = $(this).closest('.js-webform-type-checkboxes, .js-webform-type-webform-checkboxes-other');
    checkboxesRequired($element);
  }

  /**
   * Trigger an input's event handlers.
   *
   * @param {element} input
   *   An input.
   */
  function triggerEventHandlers(input) {
    var $input = $(input);
    var type = input.type;
    var tag = input.tagName.toLowerCase();
    // Add 'webform.states' as extra parameter to event handlers.
    // @see Drupal.behaviors.webformUnsaved
    var extraParameters = ['webform.states'];
    if (type === 'checkbox' || type === 'radio') {
      $input
        .trigger('change', extraParameters)
        .trigger('blur', extraParameters);
    }
    else if (tag === 'select') {
      // Do not trigger the onchange event for Address element's country code
      // when it is initialized.
      // @see \Drupal\address\Element\Country
      if ($input.closest('.webform-type-address').length) {
        if (!$input.data('webform-states-address-initialized')
          && $input.attr('autocomplete') === 'country'
          && $input.val() === $input.find("option[selected]").attr('value')) {
          return;
        }
        $input.data('webform-states-address-initialized', true);
      }

      $input
        .trigger('change', extraParameters)
        .trigger('blur', extraParameters);
    }
    else if (type !== 'submit' && type !== 'button' && type !== 'file') {
      // Make sure input mask is removed and then reset when value is restored.
      // @see https://www.drupal.org/project/webform/issues/3124155
      // @see https://www.drupal.org/project/webform/issues/3202795
      var hasInputMask = ($.fn.inputmask && $input.hasClass('js-webform-input-mask'));
      hasInputMask && $input.inputmask('remove');

      $input
        .trigger('input', extraParameters)
        .trigger('change', extraParameters)
        .trigger('keydown', extraParameters)
        .trigger('keyup', extraParameters)
        .trigger('blur', extraParameters);

      hasInputMask && $input.inputmask();
    }
  }

  /* ************************************************************************ */
  // Backup and restore value functions.
  /* ************************************************************************ */

  /**
   * Backup an input's current value and required attribute
   *
   * @param {element} input
   *   An input.
   */
  function backupValueAndRequired(input) {
    var $input = $(input);
    var type = input.type;
    var tag = input.tagName.toLowerCase(); // Normalize case.

    // Backup required.
    if ($input.prop('required') && !$input.hasData('webform-required')) {
      $input.data('webform-required', true);
    }

    // Backup value.
    if (!$input.hasData('webform-value')) {
      if (type === 'checkbox' || type === 'radio') {
        $input.data('webform-value', $input.prop('checked'));
      }
      else if (tag === 'select') {
        var values = [];
        $input.find('option:selected').each(function (i, option) {
          values[i] = option.value;
        });
        $input.data('webform-value', values);
      }
      else if (type !== 'submit' && type !== 'button') {
        $input.data('webform-value', input.value);
      }
    }
  }

  /**
   * Restore an input's value and required attribute.
   *
   * @param {element} input
   *   An input.
   */
  function restoreValueAndRequired(input) {
    var $input = $(input);

    // Restore value.
    var value = $input.data('webform-value');
    if (typeof value !== 'undefined') {
      var type = input.type;
      var tag = input.tagName.toLowerCase(); // Normalize case.

      if (type === 'checkbox' || type === 'radio') {
        $input.prop('checked', value);
      }
      else if (tag === 'select') {
        $.each(value, function (i, option_value) {
          // Prevent "Syntax error, unrecognized expression" error by
          // escaping single quotes.
          // @see https://forum.jquery.com/topic/escape-characters-prior-to-using-selector
          option_value = option_value.replace(/'/g, "\\\'");
          $input.find("option[value='" + option_value + "']").prop('selected', true);
        });
      }
      else if (type !== 'submit' && type !== 'button') {
        input.value = value;
      }
      $input.removeData('webform-value');
    }

    // Restore required.
    var required = $input.data('webform-required');
    if (typeof required !== 'undefined') {
      if (required) {
        $input.prop('required', true);
      }
      $input.removeData('webform-required');
    }
  }

  /**
   * Clear an input's value and required attributes.
   *
   * @param {element} input
   *   An input.
   */
  function clearValueAndRequired(input) {
    var $input = $(input);

    // Check for #states no clear attribute.
    // @see https://css-tricks.com/snippets/jquery/make-an-jquery-hasattr/
    if ($input.closest('[data-webform-states-no-clear]').length) {
      return;
    }

    // Clear value.
    var type = input.type;
    var tag = input.tagName.toLowerCase(); // Normalize case.
    if (type === 'checkbox' || type === 'radio') {
      $input.prop('checked', false);
    }
    else if (tag === 'select') {
      if ($input.find('option[value=""]').length) {
        $input.val('');
      }
      else {
        input.selectedIndex = -1;
      }
    }
    else if (type !== 'submit' && type !== 'button') {
      input.value = (type === 'color') ? '#000000' : '';
    }

    // Clear required.
    $input.prop('required', false);
  }

  /* ************************************************************************ */
  // Helper functions.
  /* ************************************************************************ */

  /**
   * Toggle an input's required attributes.
   *
   * @param {element} $input
   *   An input.
   * @param {boolean} required
   *   Is input required.
   */
  function toggleRequired($input, required) {
    var isCheckboxOrRadio = ($input.attr('type') === 'radio' || $input.attr('type') === 'checkbox');
    if (required) {
      if (isCheckboxOrRadio) {
        $input.attr({'required': 'required'});
      }
      else {
        $input.attr({'required': 'required', 'aria-required': 'true'});
      }
    }
    else {
      if (isCheckboxOrRadio) {
        $input.removeAttr('required');
      }
      else {
        $input.removeAttr('required aria-required');
      }
    }
  }

  /**
   * Copy the clientside_validation.module's message.
   *
   * @param {jQuery} $source
   *   The source element.
   * @param {jQuery} $destination
   *   The destination element.
   */
  function copyRequireMessage($source, $destination) {
    if ($source.attr('data-msg-required')) {
      $destination.attr('data-msg-required', $source.attr('data-msg-required'));
    }
  }

})(jQuery, Drupal);
;
/**
 * @file
 * JavaScript behaviors for webforms.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Remove single submit event listener.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches the behavior for removing single submit event listener.
   *
   * @see Drupal.behaviors.formSingleSubmit
   */
  Drupal.behaviors.webformRemoveFormSingleSubmit = {
    attach: function attach() {
      function onFormSubmit(e) {
        var $form = $(e.currentTarget);
        $form.removeAttr('data-drupal-form-submit-last');
      }
      $('body')
        .once('webform-single-submit')
        .on('submit.singleSubmit', 'form.webform-remove-single-submit', onFormSubmit);
    }
  };

  /**
   * Prevent webform autosubmit on wizard pages.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches the behavior for disabling webform autosubmit.
   *   Wizard pages need to be progressed with the Previous or Next buttons,
   *   not by pressing Enter.
   */
  Drupal.behaviors.webformDisableAutoSubmit = {
    attach: function (context) {
      // Not using context so that inputs loaded via Ajax will have autosubmit
      // disabled.
      // @see http://stackoverflow.com/questions/11235622/jquery-disable-form-submit-on-enter
      $('.js-webform-disable-autosubmit input')
        .not(':button, :submit, :reset, :image, :file')
        .once('webform-disable-autosubmit')
        .on('keyup keypress', function (e) {
          if (e.which === 13) {
            e.preventDefault();
            return false;
          }
        });
    }
  };

  /**
   * Skip client-side validation when submit button is pressed.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches the behavior for the skipping client-side validation.
   *
   * @deprecated in Webform 8.x-5.x and will be removed in Webform 8.x-6.x.
   *   Use 'formnovalidate' attribute instead.
   */
  Drupal.behaviors.webformSubmitNoValidate = {
    attach: function (context) {
      $(context).find(':submit.js-webform-novalidate')
        .once('webform-novalidate')
        .attr('formnovalidate', 'formnovalidate');
    }
  };

  /**
   * Custom required and pattern validation error messages.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches the behavior for the webform custom required and pattern
   *   validation error messages.
   *
   * @see http://stackoverflow.com/questions/5272433/html5-form-required-attribute-set-custom-validation-message
   **/
  Drupal.behaviors.webformRequiredError = {
    attach: function (context) {
      $(context).find(':input[data-webform-required-error], :input[data-webform-pattern-error]').once('webform-required-error')
        .on('invalid', function () {
          this.setCustomValidity('');
          if (this.valid) {
            return;
          }

          if (this.validity.patternMismatch && $(this).attr('data-webform-pattern-error')) {
            this.setCustomValidity($(this).attr('data-webform-pattern-error'));
          }
          else if (this.validity.valueMissing && $(this).attr('data-webform-required-error')) {
            this.setCustomValidity($(this).attr('data-webform-required-error'));
          }
        })
        .on('input change', function () {
          // Find all related elements by name and reset custom validity.
          // This specifically applies to required radios and checkboxes.
          var name = $(this).attr('name');
          $(this.form).find(':input[name="' + name + '"]').each(function () {
            this.setCustomValidity('');
          });
        });
    }
  };

  // When #state:required is triggered we need to reset the target elements
  // custom validity.
  $(document).on('state:required', function (e) {
    $(e.target).filter('[data-webform-required-error]')
      .each(function () {this.setCustomValidity('');});
  });

})(jQuery, Drupal);
;
/**
 * @file
 * JavaScript behaviors for details element.
 */

(function ($, Drupal) {

  'use strict';

  // Determine if local storage exists and is enabled.
  // This approach is copied from Modernizr.
  // @see https://github.com/Modernizr/Modernizr/blob/c56fb8b09515f629806ca44742932902ac145302/modernizr.js#L696-731
  var hasLocalStorage = (function () {
    try {
      localStorage.setItem('webform', 'webform');
      localStorage.removeItem('webform');
      return true;
    }
    catch (e) {
      return false;
    }
  }());

  /**
   * Attach handler to save details open/close state.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformDetailsSave = {
    attach: function (context) {
      if (!hasLocalStorage) {
        return;
      }

      // Summary click event handler.
      $('details > summary', context).once('webform-details-summary-save').on('click', function () {
        var $details = $(this).parent();

        // @see https://css-tricks.com/snippets/jquery/make-an-jquery-hasattr/
        if ($details[0].hasAttribute('data-webform-details-nosave')) {
          return;
        }

        var name = Drupal.webformDetailsSaveGetName($details);
        if (!name) {
          return;
        }

        var open = ($details.attr('open') !== 'open') ? '1' : '0';
        localStorage.setItem(name, open);
      });

      // Initialize details open state via local storage.
      $('details', context).once('webform-details-save').each(function () {
        var $details = $(this);

        var name = Drupal.webformDetailsSaveGetName($details);
        if (!name) {
          return;
        }

        var open = localStorage.getItem(name);
        if (open === null) {
          return;
        }

        if (open === '1') {
          $details.attr('open', 'open');
        }
        else {
          $details.removeAttr('open');
        }
      });
    }

  };

  /**
   * Get the name used to store the state of details element.
   *
   * @param {jQuery} $details
   *   A details element.
   *
   * @return {string}
   *   The name used to store the state of details element.
   */
  Drupal.webformDetailsSaveGetName = function ($details) {
    if (!hasLocalStorage) {
      return '';
    }

    // Ignore details that are vertical tabs pane.
    if ($details.hasClass('vertical-tabs__pane')) {
      return '';
    }

    // Any details element not included a webform must have define its own id.
    var webformId = $details.attr('data-webform-element-id');
    if (webformId) {
      return 'Drupal.webform.' + webformId.replace('--', '.');
    }

    var detailsId = $details.attr('id');
    if (!detailsId) {
      return '';
    }

    var $form = $details.parents('form');
    if (!$form.length || !$form.attr('id')) {
      return '';
    }

    var formId = $form.attr('id');
    if (!formId) {
      return '';
    }

    // ISSUE: When Drupal renders a webform in a modal dialog it appends a unique
    // identifier to webform ids and details ids. (i.e. my-form--FeSFISegTUI)
    // WORKAROUND: Remove the unique id that delimited using double dashes.
    formId = formId.replace(/--.+?$/, '').replace(/-/g, '_');
    detailsId = detailsId.replace(/--.+?$/, '').replace(/-/g, '_');
    return 'Drupal.webform.' + formId + '.' + detailsId;
  };

})(jQuery, Drupal);
;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function (Drupal, debounce) {
  var liveElement = void 0;
  var announcements = [];

  Drupal.behaviors.drupalAnnounce = {
    attach: function attach(context) {
      if (!liveElement) {
        liveElement = document.createElement('div');
        liveElement.id = 'drupal-live-announce';
        liveElement.className = 'visually-hidden';
        liveElement.setAttribute('aria-live', 'polite');
        liveElement.setAttribute('aria-busy', 'false');
        document.body.appendChild(liveElement);
      }
    }
  };

  function announce() {
    var text = [];
    var priority = 'polite';
    var announcement = void 0;

    var il = announcements.length;
    for (var i = 0; i < il; i++) {
      announcement = announcements.pop();
      text.unshift(announcement.text);

      if (announcement.priority === 'assertive') {
        priority = 'assertive';
      }
    }

    if (text.length) {
      liveElement.innerHTML = '';

      liveElement.setAttribute('aria-busy', 'true');

      liveElement.setAttribute('aria-live', priority);

      liveElement.innerHTML = text.join('\n');

      liveElement.setAttribute('aria-busy', 'false');
    }
  }

  Drupal.announce = function (text, priority) {
    announcements.push({
      text: text,
      priority: priority
    });

    return debounce(announce, 200)();
  };
})(Drupal, Drupal.debounce);;
/**
 * @file
 * JavaScript behaviors for details element.
 */

(function ($, Drupal) {

  'use strict';

  Drupal.webform = Drupal.webform || {};
  Drupal.webform.detailsToggle = Drupal.webform.detailsToggle || {};
  Drupal.webform.detailsToggle.options = Drupal.webform.detailsToggle.options || {};

  /**
   * Attach handler to toggle details open/close state.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformDetailsToggle = {
    attach: function (context) {
      $('.js-webform-details-toggle', context).once('webform-details-toggle').each(function () {
        var $form = $(this);
        var $tabs = $form.find('.webform-tabs');

        // Get only the main details elements and ignore all nested details.
        var selector = ($tabs.length) ? '.webform-tab' : '.js-webform-details-toggle, .webform-elements';
        var $details = $form.find('details').filter(function () {
          var $parents = $(this).parentsUntil(selector);
          return ($parents.find('details').length === 0);
        });

        // Toggle is only useful when there are two or more details elements.
        if ($details.length < 2) {
          return;
        }

        var options = $.extend({
          button: '<button type="button" class="webform-details-toggle-state"></button>'
        }, Drupal.webform.detailsToggle.options);

        // Create toggle buttons.
        var $toggle = $(options.button)
          .attr('title', Drupal.t('Toggle details widget state.'))
          .on('click', function (e) {
            // Get details that are not vertical tabs pane.
            var $details = $form.find('details:not(.vertical-tabs__pane)');
            var open;
            if (Drupal.webform.detailsToggle.isFormDetailsOpen($form)) {
              $details.removeAttr('open');
              open = 0;
            }
            else {
              $details.attr('open', 'open');
              open = 1;
            }
            Drupal.webform.detailsToggle.setDetailsToggleLabel($form);

            // Set the saved states for all the details elements.
            // @see webform.element.details.save.js
            if (Drupal.webformDetailsSaveGetName) {
              $details.each(function () {
                // Note: Drupal.webformDetailsSaveGetName checks if localStorage
                // exists and is enabled.
                // @see webform.element.details.save.js
                var name = Drupal.webformDetailsSaveGetName($(this));
                if (name) {
                  localStorage.setItem(name, open);
                }
              });
            }
          })
          .wrap('<div class="webform-details-toggle-state-wrapper"></div>')
          .parent();

        if ($tabs.length) {
          // Add toggle state before the tabs.
          $tabs.find('.item-list:first-child').eq(0).before($toggle);
        }
        else {
          // Add toggle state link to first details element.
          $details.eq(0).before($toggle);
        }

        Drupal.webform.detailsToggle.setDetailsToggleLabel($form);
      });
    }
  };

  /**
   * Determine if a webform's details are all opened.
   *
   * @param {jQuery} $form
   *   A webform.
   *
   * @return {boolean}
   *   TRUE if a webform's details are all opened.
   */
  Drupal.webform.detailsToggle.isFormDetailsOpen = function ($form) {
    return ($form.find('details[open]').length === $form.find('details').length);
  };

  /**
   * Set a webform's details toggle state widget label.
   *
   * @param {jQuery} $form
   *   A webform.
   */
  Drupal.webform.detailsToggle.setDetailsToggleLabel = function ($form) {
    var isOpen = Drupal.webform.detailsToggle.isFormDetailsOpen($form);

    var label = (isOpen) ? Drupal.t('Collapse all') : Drupal.t('Expand all');
    $form.find('.webform-details-toggle-state').html(label);

    var text = (isOpen) ? Drupal.t('All details have been expanded.') : Drupal.t('All details have been collapsed.');
    Drupal.announce(text);
  };

})(jQuery, Drupal);
;
/**
 * @file
 * JavaScript behaviors for message element integration.
 */

(function ($, Drupal) {

  'use strict';

  // Determine if local storage exists and is enabled.
  // This approach is copied from Modernizr.
  // @see https://github.com/Modernizr/Modernizr/blob/c56fb8b09515f629806ca44742932902ac145302/modernizr.js#L696-731
  var hasLocalStorage = (function () {
    try {
      localStorage.setItem('webform', 'webform');
      localStorage.removeItem('webform');
      return true;
    }
    catch (e) {
      return false;
    }
  }());

  // Determine if session storage exists and is enabled.
  // This approach is copied from Modernizr.
  // @see https://github.com/Modernizr/Modernizr/blob/c56fb8b09515f629806ca44742932902ac145302/modernizr.js#L696-731
  var hasSessionStorage = (function () {
    try {
      sessionStorage.setItem('webform', 'webform');
      sessionStorage.removeItem('webform');
      return true;
    }
    catch (e) {
      return false;
    }
  }());

  /**
   * Behavior for handler message close.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformMessageClose = {
    attach: function (context) {
      $(context).find('.js-webform-message--close').once('webform-message--close').each(function () {
        var $element = $(this);

        var id = $element.attr('data-message-id');
        var storage = $element.attr('data-message-storage');
        var effect = $element.attr('data-message-close-effect') || 'hide';
        switch (effect) {
          case 'slide': effect = 'slideUp'; break;

          case 'fade': effect = 'fadeOut'; break;
        }

        // Check storage status.
        if (isClosed($element, storage, id)) {
          return;
        }

        // Only show element if it's style is not set to 'display: none'.
        if ($element.attr('style') !== 'display: none;') {
          $element.show();
        }

        $element.find('.js-webform-message__link').on('click', function (event) {
          $element[effect]();
          setClosed($element, storage, id);
          $element.trigger('close');
          event.preventDefault();
        });
      });
    }
  };

  function isClosed($element, storage, id) {
    if (!id || !storage) {
      return false;
    }

    switch (storage) {
      case 'local':
        if (hasLocalStorage) {
          return localStorage.getItem('Drupal.webform.message.' + id) || false;
        }
        return false;

      case 'session':
        if (hasSessionStorage) {
          return sessionStorage.getItem('Drupal.webform.message.' + id) || false;
        }
        return false;

      default:
        return false;
    }
  }

  function setClosed($element, storage, id) {
    if (!id || !storage) {
      return;
    }

    switch (storage) {
      case 'local':
        if (hasLocalStorage) {
          localStorage.setItem('Drupal.webform.message.' + id, true);
        }
        break;

      case 'session':
        if (hasSessionStorage) {
          sessionStorage.setItem('Drupal.webform.message.' + id, true);
        }
        break;

      case 'user':
      case 'state':
      case 'custom':
        $.get($element.find('.js-webform-message__link').attr('href'));
        return true;
    }
  }

})(jQuery, Drupal);
;
/**
 * @file
 * JavaScript behaviors for select menu.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Disable select menu options using JavaScript.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformSelectOptionsDisabled = {
    attach: function (context) {
      $('select[data-webform-select-options-disabled]', context).once('webform-select-options-disabled').each(function () {
        var $select = $(this);
        var disabled = $select.attr('data-webform-select-options-disabled').split(/\s*,\s*/);
        $select.find('option').filter(function isDisabled() {
          return ($.inArray(this.value, disabled) !== -1);
        }).attr('disabled', 'disabled');
      });
    }
  };


})(jQuery, Drupal);
;
/* Chosen v1.8.7 | (c) 2011-2018 by Harvest | MIT License, https://github.com/harvesthq/chosen/blob/master/LICENSE.md */

(function(){var t,e,s,i,n=function(t,e){return function(){return t.apply(e,arguments)}},r=function(t,e){function s(){this.constructor=t}for(var i in e)o.call(e,i)&&(t[i]=e[i]);return s.prototype=e.prototype,t.prototype=new s,t.__super__=e.prototype,t},o={}.hasOwnProperty;(i=function(){function t(){this.options_index=0,this.parsed=[]}return t.prototype.add_node=function(t){return"OPTGROUP"===t.nodeName.toUpperCase()?this.add_group(t):this.add_option(t)},t.prototype.add_group=function(t){var e,s,i,n,r,o;for(e=this.parsed.length,this.parsed.push({array_index:e,group:!0,label:t.label,title:t.title?t.title:void 0,children:0,disabled:t.disabled,classes:t.className}),o=[],s=0,i=(r=t.childNodes).length;s<i;s++)n=r[s],o.push(this.add_option(n,e,t.disabled));return o},t.prototype.add_option=function(t,e,s){if("OPTION"===t.nodeName.toUpperCase())return""!==t.text?(null!=e&&(this.parsed[e].children+=1),this.parsed.push({array_index:this.parsed.length,options_index:this.options_index,value:t.value,text:t.text,html:t.innerHTML,title:t.title?t.title:void 0,selected:t.selected,disabled:!0===s?s:t.disabled,group_array_index:e,group_label:null!=e?this.parsed[e].label:null,classes:t.className,style:t.style.cssText})):this.parsed.push({array_index:this.parsed.length,options_index:this.options_index,empty:!0}),this.options_index+=1},t}()).select_to_array=function(t){var e,s,n,r,o;for(r=new i,s=0,n=(o=t.childNodes).length;s<n;s++)e=o[s],r.add_node(e);return r.parsed},e=function(){function t(e,s){this.form_field=e,this.options=null!=s?s:{},this.label_click_handler=n(this.label_click_handler,this),t.browser_is_supported()&&(this.is_multiple=this.form_field.multiple,this.set_default_text(),this.set_default_values(),this.setup(),this.set_up_html(),this.register_observers(),this.on_ready())}return t.prototype.set_default_values=function(){return this.click_test_action=function(t){return function(e){return t.test_active_click(e)}}(this),this.activate_action=function(t){return function(e){return t.activate_field(e)}}(this),this.active_field=!1,this.mouse_on_container=!1,this.results_showing=!1,this.result_highlighted=null,this.is_rtl=this.options.rtl||/\bchosen-rtl\b/.test(this.form_field.className),this.allow_single_deselect=null!=this.options.allow_single_deselect&&null!=this.form_field.options[0]&&""===this.form_field.options[0].text&&this.options.allow_single_deselect,this.disable_search_threshold=this.options.disable_search_threshold||0,this.disable_search=this.options.disable_search||!1,this.enable_split_word_search=null==this.options.enable_split_word_search||this.options.enable_split_word_search,this.group_search=null==this.options.group_search||this.options.group_search,this.search_contains=this.options.search_contains||!1,this.single_backstroke_delete=null==this.options.single_backstroke_delete||this.options.single_backstroke_delete,this.max_selected_options=this.options.max_selected_options||Infinity,this.inherit_select_classes=this.options.inherit_select_classes||!1,this.display_selected_options=null==this.options.display_selected_options||this.options.display_selected_options,this.display_disabled_options=null==this.options.display_disabled_options||this.options.display_disabled_options,this.include_group_label_in_selected=this.options.include_group_label_in_selected||!1,this.max_shown_results=this.options.max_shown_results||Number.POSITIVE_INFINITY,this.case_sensitive_search=this.options.case_sensitive_search||!1,this.hide_results_on_select=null==this.options.hide_results_on_select||this.options.hide_results_on_select},t.prototype.set_default_text=function(){return this.form_field.getAttribute("data-placeholder")?this.default_text=this.form_field.getAttribute("data-placeholder"):this.is_multiple?this.default_text=this.options.placeholder_text_multiple||this.options.placeholder_text||t.default_multiple_text:this.default_text=this.options.placeholder_text_single||this.options.placeholder_text||t.default_single_text,this.default_text=this.escape_html(this.default_text),this.results_none_found=this.form_field.getAttribute("data-no_results_text")||this.options.no_results_text||t.default_no_result_text},t.prototype.choice_label=function(t){return this.include_group_label_in_selected&&null!=t.group_label?"<b class='group-name'>"+this.escape_html(t.group_label)+"</b>"+t.html:t.html},t.prototype.mouse_enter=function(){return this.mouse_on_container=!0},t.prototype.mouse_leave=function(){return this.mouse_on_container=!1},t.prototype.input_focus=function(t){if(this.is_multiple){if(!this.active_field)return setTimeout(function(t){return function(){return t.container_mousedown()}}(this),50)}else if(!this.active_field)return this.activate_field()},t.prototype.input_blur=function(t){if(!this.mouse_on_container)return this.active_field=!1,setTimeout(function(t){return function(){return t.blur_test()}}(this),100)},t.prototype.label_click_handler=function(t){return this.is_multiple?this.container_mousedown(t):this.activate_field()},t.prototype.results_option_build=function(t){var e,s,i,n,r,o,h;for(e="",h=0,n=0,r=(o=this.results_data).length;n<r&&(s=o[n],i="",""!==(i=s.group?this.result_add_group(s):this.result_add_option(s))&&(h++,e+=i),(null!=t?t.first:void 0)&&(s.selected&&this.is_multiple?this.choice_build(s):s.selected&&!this.is_multiple&&this.single_set_selected_text(this.choice_label(s))),!(h>=this.max_shown_results));n++);return e},t.prototype.result_add_option=function(t){var e,s;return t.search_match&&this.include_option_in_results(t)?(e=[],t.disabled||t.selected&&this.is_multiple||e.push("active-result"),!t.disabled||t.selected&&this.is_multiple||e.push("disabled-result"),t.selected&&e.push("result-selected"),null!=t.group_array_index&&e.push("group-option"),""!==t.classes&&e.push(t.classes),s=document.createElement("li"),s.className=e.join(" "),t.style&&(s.style.cssText=t.style),s.setAttribute("data-option-array-index",t.array_index),s.innerHTML=t.highlighted_html||t.html,t.title&&(s.title=t.title),this.outerHTML(s)):""},t.prototype.result_add_group=function(t){var e,s;return(t.search_match||t.group_match)&&t.active_options>0?((e=[]).push("group-result"),t.classes&&e.push(t.classes),s=document.createElement("li"),s.className=e.join(" "),s.innerHTML=t.highlighted_html||this.escape_html(t.label),t.title&&(s.title=t.title),this.outerHTML(s)):""},t.prototype.results_update_field=function(){if(this.set_default_text(),this.is_multiple||this.results_reset_cleanup(),this.result_clear_highlight(),this.results_build(),this.results_showing)return this.winnow_results()},t.prototype.reset_single_select_options=function(){var t,e,s,i,n;for(n=[],t=0,e=(s=this.results_data).length;t<e;t++)(i=s[t]).selected?n.push(i.selected=!1):n.push(void 0);return n},t.prototype.results_toggle=function(){return this.results_showing?this.results_hide():this.results_show()},t.prototype.results_search=function(t){return this.results_showing?this.winnow_results():this.results_show()},t.prototype.winnow_results=function(t){var e,s,i,n,r,o,h,l,c,_,a,u,d,p,f;for(this.no_results_clear(),_=0,e=(h=this.get_search_text()).replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"),c=this.get_search_regex(e),i=0,n=(l=this.results_data).length;i<n;i++)(r=l[i]).search_match=!1,a=null,u=null,r.highlighted_html="",this.include_option_in_results(r)&&(r.group&&(r.group_match=!1,r.active_options=0),null!=r.group_array_index&&this.results_data[r.group_array_index]&&(0===(a=this.results_data[r.group_array_index]).active_options&&a.search_match&&(_+=1),a.active_options+=1),f=r.group?r.label:r.text,r.group&&!this.group_search||(u=this.search_string_match(f,c),r.search_match=null!=u,r.search_match&&!r.group&&(_+=1),r.search_match?(h.length&&(d=u.index,o=f.slice(0,d),s=f.slice(d,d+h.length),p=f.slice(d+h.length),r.highlighted_html=this.escape_html(o)+"<em>"+this.escape_html(s)+"</em>"+this.escape_html(p)),null!=a&&(a.group_match=!0)):null!=r.group_array_index&&this.results_data[r.group_array_index].search_match&&(r.search_match=!0)));return this.result_clear_highlight(),_<1&&h.length?(this.update_results_content(""),this.no_results(h)):(this.update_results_content(this.results_option_build()),(null!=t?t.skip_highlight:void 0)?void 0:this.winnow_results_set_highlight())},t.prototype.get_search_regex=function(t){var e,s;return s=this.search_contains?t:"(^|\\s|\\b)"+t+"[^\\s]*",this.enable_split_word_search||this.search_contains||(s="^"+s),e=this.case_sensitive_search?"":"i",new RegExp(s,e)},t.prototype.search_string_match=function(t,e){var s;return s=e.exec(t),!this.search_contains&&(null!=s?s[1]:void 0)&&(s.index+=1),s},t.prototype.choices_count=function(){var t,e,s;if(null!=this.selected_option_count)return this.selected_option_count;for(this.selected_option_count=0,t=0,e=(s=this.form_field.options).length;t<e;t++)s[t].selected&&(this.selected_option_count+=1);return this.selected_option_count},t.prototype.choices_click=function(t){if(t.preventDefault(),this.activate_field(),!this.results_showing&&!this.is_disabled)return this.results_show()},t.prototype.keydown_checker=function(t){var e,s;switch(s=null!=(e=t.which)?e:t.keyCode,this.search_field_scale(),8!==s&&this.pending_backstroke&&this.clear_backstroke(),s){case 8:this.backstroke_length=this.get_search_field_value().length;break;case 9:this.results_showing&&!this.is_multiple&&this.result_select(t),this.mouse_on_container=!1;break;case 13:case 27:this.results_showing&&t.preventDefault();break;case 32:this.disable_search&&t.preventDefault();break;case 38:t.preventDefault(),this.keyup_arrow();break;case 40:t.preventDefault(),this.keydown_arrow()}},t.prototype.keyup_checker=function(t){var e,s;switch(s=null!=(e=t.which)?e:t.keyCode,this.search_field_scale(),s){case 8:this.is_multiple&&this.backstroke_length<1&&this.choices_count()>0?this.keydown_backstroke():this.pending_backstroke||(this.result_clear_highlight(),this.results_search());break;case 13:t.preventDefault(),this.results_showing&&this.result_select(t);break;case 27:this.results_showing&&this.results_hide();break;case 9:case 16:case 17:case 18:case 38:case 40:case 91:break;default:this.results_search()}},t.prototype.clipboard_event_checker=function(t){if(!this.is_disabled)return setTimeout(function(t){return function(){return t.results_search()}}(this),50)},t.prototype.container_width=function(){return null!=this.options.width?this.options.width:this.form_field.offsetWidth+"px"},t.prototype.include_option_in_results=function(t){return!(this.is_multiple&&!this.display_selected_options&&t.selected)&&(!(!this.display_disabled_options&&t.disabled)&&!t.empty)},t.prototype.search_results_touchstart=function(t){return this.touch_started=!0,this.search_results_mouseover(t)},t.prototype.search_results_touchmove=function(t){return this.touch_started=!1,this.search_results_mouseout(t)},t.prototype.search_results_touchend=function(t){if(this.touch_started)return this.search_results_mouseup(t)},t.prototype.outerHTML=function(t){var e;return t.outerHTML?t.outerHTML:((e=document.createElement("div")).appendChild(t),e.innerHTML)},t.prototype.get_single_html=function(){return'<a class="chosen-single chosen-default">\n  <span>'+this.default_text+'</span>\n  <div><b></b></div>\n</a>\n<div class="chosen-drop">\n  <div class="chosen-search">\n    <input class="chosen-search-input" type="text" autocomplete="off" />\n  </div>\n  <ul class="chosen-results"></ul>\n</div>'},t.prototype.get_multi_html=function(){return'<ul class="chosen-choices">\n  <li class="search-field">\n    <input class="chosen-search-input" type="text" autocomplete="off" value="'+this.default_text+'" />\n  </li>\n</ul>\n<div class="chosen-drop">\n  <ul class="chosen-results"></ul>\n</div>'},t.prototype.get_no_results_html=function(t){return'<li class="no-results">\n  '+this.results_none_found+" <span>"+this.escape_html(t)+"</span>\n</li>"},t.browser_is_supported=function(){return"Microsoft Internet Explorer"===window.navigator.appName?document.documentMode>=8:!(/iP(od|hone)/i.test(window.navigator.userAgent)||/IEMobile/i.test(window.navigator.userAgent)||/Windows Phone/i.test(window.navigator.userAgent)||/BlackBerry/i.test(window.navigator.userAgent)||/BB10/i.test(window.navigator.userAgent)||/Android.*Mobile/i.test(window.navigator.userAgent))},t.default_multiple_text="Select Some Options",t.default_single_text="Select an Option",t.default_no_result_text="No results match",t}(),(t=jQuery).fn.extend({chosen:function(i){return e.browser_is_supported()?this.each(function(e){var n,r;r=(n=t(this)).data("chosen"),"destroy"!==i?r instanceof s||n.data("chosen",new s(this,i)):r instanceof s&&r.destroy()}):this}}),s=function(s){function n(){return n.__super__.constructor.apply(this,arguments)}return r(n,e),n.prototype.setup=function(){return this.form_field_jq=t(this.form_field),this.current_selectedIndex=this.form_field.selectedIndex},n.prototype.set_up_html=function(){var e,s;return(e=["chosen-container"]).push("chosen-container-"+(this.is_multiple?"multi":"single")),this.inherit_select_classes&&this.form_field.className&&e.push(this.form_field.className),this.is_rtl&&e.push("chosen-rtl"),s={"class":e.join(" "),title:this.form_field.title},this.form_field.id.length&&(s.id=this.form_field.id.replace(/[^\w]/g,"_")+"_chosen"),this.container=t("<div />",s),this.container.width(this.container_width()),this.is_multiple?this.container.html(this.get_multi_html()):this.container.html(this.get_single_html()),this.form_field_jq.hide().after(this.container),this.dropdown=this.container.find("div.chosen-drop").first(),this.search_field=this.container.find("input").first(),this.search_results=this.container.find("ul.chosen-results").first(),this.search_field_scale(),this.search_no_results=this.container.find("li.no-results").first(),this.is_multiple?(this.search_choices=this.container.find("ul.chosen-choices").first(),this.search_container=this.container.find("li.search-field").first()):(this.search_container=this.container.find("div.chosen-search").first(),this.selected_item=this.container.find(".chosen-single").first()),this.results_build(),this.set_tab_index(),this.set_label_behavior()},n.prototype.on_ready=function(){return this.form_field_jq.trigger("chosen:ready",{chosen:this})},n.prototype.register_observers=function(){return this.container.on("touchstart.chosen",function(t){return function(e){t.container_mousedown(e)}}(this)),this.container.on("touchend.chosen",function(t){return function(e){t.container_mouseup(e)}}(this)),this.container.on("mousedown.chosen",function(t){return function(e){t.container_mousedown(e)}}(this)),this.container.on("mouseup.chosen",function(t){return function(e){t.container_mouseup(e)}}(this)),this.container.on("mouseenter.chosen",function(t){return function(e){t.mouse_enter(e)}}(this)),this.container.on("mouseleave.chosen",function(t){return function(e){t.mouse_leave(e)}}(this)),this.search_results.on("mouseup.chosen",function(t){return function(e){t.search_results_mouseup(e)}}(this)),this.search_results.on("mouseover.chosen",function(t){return function(e){t.search_results_mouseover(e)}}(this)),this.search_results.on("mouseout.chosen",function(t){return function(e){t.search_results_mouseout(e)}}(this)),this.search_results.on("mousewheel.chosen DOMMouseScroll.chosen",function(t){return function(e){t.search_results_mousewheel(e)}}(this)),this.search_results.on("touchstart.chosen",function(t){return function(e){t.search_results_touchstart(e)}}(this)),this.search_results.on("touchmove.chosen",function(t){return function(e){t.search_results_touchmove(e)}}(this)),this.search_results.on("touchend.chosen",function(t){return function(e){t.search_results_touchend(e)}}(this)),this.form_field_jq.on("chosen:updated.chosen",function(t){return function(e){t.results_update_field(e)}}(this)),this.form_field_jq.on("chosen:activate.chosen",function(t){return function(e){t.activate_field(e)}}(this)),this.form_field_jq.on("chosen:open.chosen",function(t){return function(e){t.container_mousedown(e)}}(this)),this.form_field_jq.on("chosen:close.chosen",function(t){return function(e){t.close_field(e)}}(this)),this.search_field.on("blur.chosen",function(t){return function(e){t.input_blur(e)}}(this)),this.search_field.on("keyup.chosen",function(t){return function(e){t.keyup_checker(e)}}(this)),this.search_field.on("keydown.chosen",function(t){return function(e){t.keydown_checker(e)}}(this)),this.search_field.on("focus.chosen",function(t){return function(e){t.input_focus(e)}}(this)),this.search_field.on("cut.chosen",function(t){return function(e){t.clipboard_event_checker(e)}}(this)),this.search_field.on("paste.chosen",function(t){return function(e){t.clipboard_event_checker(e)}}(this)),this.is_multiple?this.search_choices.on("click.chosen",function(t){return function(e){t.choices_click(e)}}(this)):this.container.on("click.chosen",function(t){t.preventDefault()})},n.prototype.destroy=function(){return t(this.container[0].ownerDocument).off("click.chosen",this.click_test_action),this.form_field_label.length>0&&this.form_field_label.off("click.chosen"),this.search_field[0].tabIndex&&(this.form_field_jq[0].tabIndex=this.search_field[0].tabIndex),this.container.remove(),this.form_field_jq.removeData("chosen"),this.form_field_jq.show()},n.prototype.search_field_disabled=function(){return this.is_disabled=this.form_field.disabled||this.form_field_jq.parents("fieldset").is(":disabled"),this.container.toggleClass("chosen-disabled",this.is_disabled),this.search_field[0].disabled=this.is_disabled,this.is_multiple||this.selected_item.off("focus.chosen",this.activate_field),this.is_disabled?this.close_field():this.is_multiple?void 0:this.selected_item.on("focus.chosen",this.activate_field)},n.prototype.container_mousedown=function(e){var s;if(!this.is_disabled)return!e||"mousedown"!==(s=e.type)&&"touchstart"!==s||this.results_showing||e.preventDefault(),null!=e&&t(e.target).hasClass("search-choice-close")?void 0:(this.active_field?this.is_multiple||!e||t(e.target)[0]!==this.selected_item[0]&&!t(e.target).parents("a.chosen-single").length||(e.preventDefault(),this.results_toggle()):(this.is_multiple&&this.search_field.val(""),t(this.container[0].ownerDocument).on("click.chosen",this.click_test_action),this.results_show()),this.activate_field())},n.prototype.container_mouseup=function(t){if("ABBR"===t.target.nodeName&&!this.is_disabled)return this.results_reset(t)},n.prototype.search_results_mousewheel=function(t){var e;if(t.originalEvent&&(e=t.originalEvent.deltaY||-t.originalEvent.wheelDelta||t.originalEvent.detail),null!=e)return t.preventDefault(),"DOMMouseScroll"===t.type&&(e*=40),this.search_results.scrollTop(e+this.search_results.scrollTop())},n.prototype.blur_test=function(t){if(!this.active_field&&this.container.hasClass("chosen-container-active"))return this.close_field()},n.prototype.close_field=function(){return t(this.container[0].ownerDocument).off("click.chosen",this.click_test_action),this.active_field=!1,this.results_hide(),this.container.removeClass("chosen-container-active"),this.clear_backstroke(),this.show_search_field_default(),this.search_field_scale(),this.search_field.blur()},n.prototype.activate_field=function(){if(!this.is_disabled)return this.container.addClass("chosen-container-active"),this.active_field=!0,this.search_field.val(this.search_field.val()),this.search_field.focus()},n.prototype.test_active_click=function(e){var s;return(s=t(e.target).closest(".chosen-container")).length&&this.container[0]===s[0]?this.active_field=!0:this.close_field()},n.prototype.results_build=function(){return this.parsing=!0,this.selected_option_count=null,this.results_data=i.select_to_array(this.form_field),this.is_multiple?this.search_choices.find("li.search-choice").remove():(this.single_set_selected_text(),this.disable_search||this.form_field.options.length<=this.disable_search_threshold?(this.search_field[0].readOnly=!0,this.container.addClass("chosen-container-single-nosearch")):(this.search_field[0].readOnly=!1,this.container.removeClass("chosen-container-single-nosearch"))),this.update_results_content(this.results_option_build({first:!0})),this.search_field_disabled(),this.show_search_field_default(),this.search_field_scale(),this.parsing=!1},n.prototype.result_do_highlight=function(t){var e,s,i,n,r;if(t.length){if(this.result_clear_highlight(),this.result_highlight=t,this.result_highlight.addClass("highlighted"),i=parseInt(this.search_results.css("maxHeight"),10),r=this.search_results.scrollTop(),n=i+r,s=this.result_highlight.position().top+this.search_results.scrollTop(),(e=s+this.result_highlight.outerHeight())>=n)return this.search_results.scrollTop(e-i>0?e-i:0);if(s<r)return this.search_results.scrollTop(s)}},n.prototype.result_clear_highlight=function(){return this.result_highlight&&this.result_highlight.removeClass("highlighted"),this.result_highlight=null},n.prototype.results_show=function(){return this.is_multiple&&this.max_selected_options<=this.choices_count()?(this.form_field_jq.trigger("chosen:maxselected",{chosen:this}),!1):(this.container.addClass("chosen-with-drop"),this.results_showing=!0,this.search_field.focus(),this.search_field.val(this.get_search_field_value()),this.winnow_results(),this.form_field_jq.trigger("chosen:showing_dropdown",{chosen:this}))},n.prototype.update_results_content=function(t){return this.search_results.html(t)},n.prototype.results_hide=function(){return this.results_showing&&(this.result_clear_highlight(),this.container.removeClass("chosen-with-drop"),this.form_field_jq.trigger("chosen:hiding_dropdown",{chosen:this})),this.results_showing=!1},n.prototype.set_tab_index=function(t){var e;if(this.form_field.tabIndex)return e=this.form_field.tabIndex,this.form_field.tabIndex=-1,this.search_field[0].tabIndex=e},n.prototype.set_label_behavior=function(){if(this.form_field_label=this.form_field_jq.parents("label"),!this.form_field_label.length&&this.form_field.id.length&&(this.form_field_label=t("label[for='"+this.form_field.id+"']")),this.form_field_label.length>0)return this.form_field_label.on("click.chosen",this.label_click_handler)},n.prototype.show_search_field_default=function(){return this.is_multiple&&this.choices_count()<1&&!this.active_field?(this.search_field.val(this.default_text),this.search_field.addClass("default")):(this.search_field.val(""),this.search_field.removeClass("default"))},n.prototype.search_results_mouseup=function(e){var s;if((s=t(e.target).hasClass("active-result")?t(e.target):t(e.target).parents(".active-result").first()).length)return this.result_highlight=s,this.result_select(e),this.search_field.focus()},n.prototype.search_results_mouseover=function(e){var s;if(s=t(e.target).hasClass("active-result")?t(e.target):t(e.target).parents(".active-result").first())return this.result_do_highlight(s)},n.prototype.search_results_mouseout=function(e){if(t(e.target).hasClass("active-result")||t(e.target).parents(".active-result").first())return this.result_clear_highlight()},n.prototype.choice_build=function(e){var s,i;return s=t("<li />",{"class":"search-choice"}).html("<span>"+this.choice_label(e)+"</span>"),e.disabled?s.addClass("search-choice-disabled"):((i=t("<a />",{"class":"search-choice-close","data-option-array-index":e.array_index})).on("click.chosen",function(t){return function(e){return t.choice_destroy_link_click(e)}}(this)),s.append(i)),this.search_container.before(s)},n.prototype.choice_destroy_link_click=function(e){if(e.preventDefault(),e.stopPropagation(),!this.is_disabled)return this.choice_destroy(t(e.target))},n.prototype.choice_destroy=function(t){if(this.result_deselect(t[0].getAttribute("data-option-array-index")))return this.active_field?this.search_field.focus():this.show_search_field_default(),this.is_multiple&&this.choices_count()>0&&this.get_search_field_value().length<1&&this.results_hide(),t.parents("li").first().remove(),this.search_field_scale()},n.prototype.results_reset=function(){if(this.reset_single_select_options(),this.form_field.options[0].selected=!0,this.single_set_selected_text(),this.show_search_field_default(),this.results_reset_cleanup(),this.trigger_form_field_change(),this.active_field)return this.results_hide()},n.prototype.results_reset_cleanup=function(){return this.current_selectedIndex=this.form_field.selectedIndex,this.selected_item.find("abbr").remove()},n.prototype.result_select=function(t){var e,s;if(this.result_highlight)return e=this.result_highlight,this.result_clear_highlight(),this.is_multiple&&this.max_selected_options<=this.choices_count()?(this.form_field_jq.trigger("chosen:maxselected",{chosen:this}),!1):(this.is_multiple?e.removeClass("active-result"):this.reset_single_select_options(),e.addClass("result-selected"),s=this.results_data[e[0].getAttribute("data-option-array-index")],s.selected=!0,this.form_field.options[s.options_index].selected=!0,this.selected_option_count=null,this.is_multiple?this.choice_build(s):this.single_set_selected_text(this.choice_label(s)),this.is_multiple&&(!this.hide_results_on_select||t.metaKey||t.ctrlKey)?t.metaKey||t.ctrlKey?this.winnow_results({skip_highlight:!0}):(this.search_field.val(""),this.winnow_results()):(this.results_hide(),this.show_search_field_default()),(this.is_multiple||this.form_field.selectedIndex!==this.current_selectedIndex)&&this.trigger_form_field_change({selected:this.form_field.options[s.options_index].value}),this.current_selectedIndex=this.form_field.selectedIndex,t.preventDefault(),this.search_field_scale())},n.prototype.single_set_selected_text=function(t){return null==t&&(t=this.default_text),t===this.default_text?this.selected_item.addClass("chosen-default"):(this.single_deselect_control_build(),this.selected_item.removeClass("chosen-default")),this.selected_item.find("span").html(t)},n.prototype.result_deselect=function(t){var e;return e=this.results_data[t],!this.form_field.options[e.options_index].disabled&&(e.selected=!1,this.form_field.options[e.options_index].selected=!1,this.selected_option_count=null,this.result_clear_highlight(),this.results_showing&&this.winnow_results(),this.trigger_form_field_change({deselected:this.form_field.options[e.options_index].value}),this.search_field_scale(),!0)},n.prototype.single_deselect_control_build=function(){if(this.allow_single_deselect)return this.selected_item.find("abbr").length||this.selected_item.find("span").first().after('<abbr class="search-choice-close"></abbr>'),this.selected_item.addClass("chosen-single-with-deselect")},n.prototype.get_search_field_value=function(){return this.search_field.val()},n.prototype.get_search_text=function(){return t.trim(this.get_search_field_value())},n.prototype.escape_html=function(e){return t("<div/>").text(e).html()},n.prototype.winnow_results_set_highlight=function(){var t,e;if(e=this.is_multiple?[]:this.search_results.find(".result-selected.active-result"),null!=(t=e.length?e.first():this.search_results.find(".active-result").first()))return this.result_do_highlight(t)},n.prototype.no_results=function(t){var e;return e=this.get_no_results_html(t),this.search_results.append(e),this.form_field_jq.trigger("chosen:no_results",{chosen:this})},n.prototype.no_results_clear=function(){return this.search_results.find(".no-results").remove()},n.prototype.keydown_arrow=function(){var t;return this.results_showing&&this.result_highlight?(t=this.result_highlight.nextAll("li.active-result").first())?this.result_do_highlight(t):void 0:this.results_show()},n.prototype.keyup_arrow=function(){var t;return this.results_showing||this.is_multiple?this.result_highlight?(t=this.result_highlight.prevAll("li.active-result")).length?this.result_do_highlight(t.first()):(this.choices_count()>0&&this.results_hide(),this.result_clear_highlight()):void 0:this.results_show()},n.prototype.keydown_backstroke=function(){var t;return this.pending_backstroke?(this.choice_destroy(this.pending_backstroke.find("a").first()),this.clear_backstroke()):(t=this.search_container.siblings("li.search-choice").last()).length&&!t.hasClass("search-choice-disabled")?(this.pending_backstroke=t,this.single_backstroke_delete?this.keydown_backstroke():this.pending_backstroke.addClass("search-choice-focus")):void 0},n.prototype.clear_backstroke=function(){return this.pending_backstroke&&this.pending_backstroke.removeClass("search-choice-focus"),this.pending_backstroke=null},n.prototype.search_field_scale=function(){var e,s,i,n,r,o,h;if(this.is_multiple){for(r={position:"absolute",left:"-1000px",top:"-1000px",display:"none",whiteSpace:"pre"},s=0,i=(o=["fontSize","fontStyle","fontWeight","fontFamily","lineHeight","textTransform","letterSpacing"]).length;s<i;s++)r[n=o[s]]=this.search_field.css(n);return(e=t("<div />").css(r)).text(this.get_search_field_value()),t("body").append(e),h=e.width()+25,e.remove(),this.container.is(":visible")&&(h=Math.min(this.container.outerWidth()-10,h)),this.search_field.width(h)}},n.prototype.trigger_form_field_change=function(t){return this.form_field_jq.trigger("input",t),this.form_field_jq.trigger("change",t)},n}()}).call(this);;
/**
 * @file
 * Attaches behaviors for the Chosen module.
 */

(function($, Drupal, drupalSettings) {
  'use strict';

  // Temporal workaround while  https://github.com/harvesthq/chosen/issues/515
  // is fixed. This fix was taken from:
  // https://github.com/harvesthq/chosen/issues/515#issuecomment-104602031
  $.fn.oldChosen = $.fn.chosen;
  $.fn.chosen = function(options) {
    var select = $(this)
      , is_creating_chosen = !!options;

    if (is_creating_chosen && select.css('position') === 'absolute') {
      // if we are creating a chosen and the select already has the appropriate styles added
      // we remove those (so that the select hasn't got a crazy width), then create the chosen
      // then we re-add them later
      select.removeAttr('style');
    }

    var ret = select.oldChosen(options);

    // only act if the select has display: none, otherwise chosen is unsupported (iPhone, etc)
    if (is_creating_chosen && select.css('display') === 'none') {
      // https://github.com/harvesthq/chosen/issues/515#issuecomment-33214050
      // only do this if we are initializing chosen (no params, or object params) not calling a method
      select.attr('style','display:visible; position:absolute; width:0px; height: 0px; clip:rect(0,0,0,0)');
      select.attr('tabindex', -1);
    }
    return ret;
  };

  // Update Chosen elements when state has changed.
  $(document).on('state:disabled', 'select', function (e) {
    $(e.target).trigger('chosen:updated');
  });

  Drupal.behaviors.chosen = {

    settings: {

      /**
       * Completely ignores elements that match one of these selectors.
       *
       * Disabled on:
       * - Field UI
       * - WYSIWYG elements
       * - Tabledrag weights
       * - Elements that have opted-out of Chosen
       * - Elements already processed by Chosen.
       *
       * @type {string}
       */
      ignoreSelector: '#field-ui-field-storage-add-form select, #entity-form-display-edit-form select, #entity-view-display-edit-form select, .wysiwyg, .draggable select[name$="[weight]"], .draggable select[name$="[position]"], .locale-translate-filter-form select, .chosen-disable, .chosen-processed',

      /**
       * Explicit "opt-in" selector.
       *
       * @type {string}
       */
      optedInSelector: 'select.chosen-enable',

      /**
       * The default selector, overridden by drupalSettings.
       *
       * @type {string}
       */
      selector: 'select:visible'
    },

    /**
     * Drupal attach behavior.
     */
    attach: function(context, settings) {
      this.settings = this.getSettings(settings);
      this.getElements(context).once('chosen').each(function (i, element) {
        this.createChosen(element);
      }.bind(this));
    },

    /**
     * Creates a Chosen instance for a specific element.
     *
     * @param {jQuery|HTMLElement} element
     *   The element.
     */
    createChosen: function(element) {
      var $element = $(element);
      $element.chosen(this.getElementOptions($element));
    },

    /**
     * Filter out elements that should not be converted into Chosen.
     *
     * @param {jQuery|HTMLElement} element
     *   The element.
     *
     * @return {boolean}
     *   TRUE if the element should stay, FALSE otherwise.
     */
    filterElements: function (element) {
      var $element = $(element);

      // Remove elements that should be ignored completely.
      if ($element.is(this.settings.ignoreSelector)) {
        return false;
      }

      // Zero value means no minimum.
      var minOptions = $element.attr('multiple') ? this.settings.minimum_multiple : this.settings.minimum_single;
      return !minOptions || $element.find('option').length >= minOptions;
    },

    /**
     * Retrieves the elements that should be converted into Chosen instances.
     *
     * @param {jQuery|Element} context
     *   A DOM Element, Document, or jQuery object to use as context.
     * @param {string} [selector]
     *   A selector to use, defaults to the default selector in the settings.
     */
    getElements: function (context, selector) {
      var $context = $(context || document);
      var $elements = $context.find(selector || this.settings.selector);

      // Remove elements that should not be converted into Chosen.
      $elements = $elements.filter(function(i, element) {
        return this.filterElements(element);
      }.bind(this));

      // Add elements that have explicitly opted in to Chosen.
      $elements = $elements.add($context.find(this.settings.optedInSelector));

      return $elements;
    },

    /**
     * Retrieves options used to create a Chosen instance based on an element.
     *
     * @param {jQuery|HTMLElement} element
     *   The element to process.
     *
     * @return {Object}
     *   The options object used to instantiate a Chosen instance with.
     */
    getElementOptions: function (element) {
      var $element = $(element);
      var options = $.extend({}, this.settings.options);
      var dimension;
      var width;

      // The width default option is considered the minimum width, so this
      // must be evaluated for every option.
      if (this.settings.minimum_width > 0) {
        // Given we need to manage settings as both percentage and pixel widths,
        // we need to handle width calculations separately.
        if (this.settings.use_relative_width) {
          dimension = '%';
          width = ($element.width() / $element.parent().width() * 100).toPrecision(5);
        }
        else {
          dimension = 'px';
          width = $element.width();
        }

        if (width < this.settings.minimum_width) {
          options.width = this.settings.minimum_width + dimension;
        }
        else {
          options.width = width + dimension;
        }
      }

      // Some field widgets have cardinality, so we must respect that.
      // @see \Drupal\chosen\ChosenFormRender::preRenderSelect()
      var cardinality;
      if ($element.attr('multiple') && (cardinality = $element.data('cardinality'))) {
        options.max_selected_options = cardinality;
      }

      return options;
    },

    /**
     * Retrieves the settings passed from Drupal.
     *
     * @param {Object} [settings]
     *   Passed Drupal settings object, if any.
     */
    getSettings: function (settings) {
      return $.extend(true, {}, this.settings, settings && settings.chosen || drupalSettings.chosen);
    }

};

})(jQuery, Drupal, drupalSettings);
;
!function(Drupal,$,window){Drupal.behaviors.touringSearch={attach:function(context,settings){}}}(Drupal,jQuery,this);
