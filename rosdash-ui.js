///////////////////////////////////// sidebar


// init the entire sidebar
ROSDASH.initSidebar = function ()
{
	ROSDASH.initForm();
}


///////////////////////////////////// sidebar form by dhtmlXForm


ROSDASH.formCanvas = "rosform";
ROSDASH.formConfig = {
	main: 100,
	dir: 120,
	item: 150,
	config: 120,
};
// the main form for editor
ROSDASH.formEditorMain = [
	{
		type: "label",
		label: "Dashboard",
		name: "dashlabel",
		width: ROSDASH.formConfig.main
	}, {
		type: "button",
		value: "Config",
		name: "dashboard",
		width: ROSDASH.formConfig.main
	}, {
		type: "label",
		label: "Add a widget",
		name: "addlabel",
		width: ROSDASH.formConfig.main
	}, {
		type: "button",
		value: "Widgets",
		name: "addwidget",
		width: ROSDASH.formConfig.main
	}, {
		type: "button",
		value: "Blocks",
		name: "addblock",
		width: ROSDASH.formConfig.main
	}, {
		type: "button",
		value: "Constants",
		name: "addconstant",
		width: ROSDASH.formConfig.main
	}, {
		type: "button",
		value: "ROS items",
		name: "addROSitem",
		width: ROSDASH.formConfig.main
	}, {
		type: "button",
		value: "Comments",
		name: "comment",
		width: ROSDASH.formConfig.main
	}
];
// the form object
ROSDASH.form;
// the callback function handle for clicking
ROSDASH.formItemType;
// the second parameter
ROSDASH.formItemType2;
// current directory in the form
ROSDASH.formList;
// count the items in the form in order to help append buttons
ROSDASH.formCount = 0;
// init a new form when beginning or return to main page
ROSDASH.initForm = function ()
{
	ROSDASH.removeForm();
	// create a new form
	ROSDASH.form = new dhtmlXForm(ROSDASH.formCanvas, ROSDASH.formEditorMain);
	ROSDASH.formCount = ROSDASH.formEditorMain.length;
	// callbacks for buttons in form
	ROSDASH.form.attachEvent("onButtonClick", function(id)
	{
		// if a directory
		if (id.substring(0, 4) == "dir-")
		{
			ROSDASH.formClickDir(id.substring(4));
			return;
		}
		// if an item
		if (id.substring(0, 5) == "item-")
		{
			ROSDASH.formClickItem(id.substring(5));
			return;
		}
		switch (id)
		{
		// back to the main page
		case "backhome":
			ROSDASH.formList = undefined;
			ROSDASH.formItemType = undefined;
			ROSDASH.initForm();
			break;
		// add a new block
		case "addblock":
			ROSDASH.formList = ROSDASH.blockList;
			ROSDASH.formItemType = "addBlockByType";
			ROSDASH.showItemsInForm({
				type: "button",
				value: "Blocks",
				name: "addblock",
				width: ROSDASH.formConfig.main
			});
			break;
		// add a new constant
		case "addconstant":
			ROSDASH.formList = ROSDASH.msgList;
			ROSDASH.formItemType = "addConstant";
			ROSDASH.showItemsInForm({
				type: "button",
				value: "Constants",
				name: "addconstant",
				width: ROSDASH.formConfig.main
			});
			break;
		// add a new ros item
		case "addROSitem":
			ROSDASH.formList = ROSDASH.rosNames;
			// ROSDASH.formItemType2 is needed to choose ros item
			ROSDASH.formItemType = "addRosItem";
			ROSDASH.showItemsInForm({
				type: "button",
				value: "ROS items",
				name: "addROSitem",
				width: ROSDASH.formConfig.main
			});
			break;
		// add a new widget
		case "addwidget":
			ROSDASH.formList = ROSDASH.widgetList;
			ROSDASH.formItemType = "addWidgetByType";
			ROSDASH.showItemsInForm({
				type: "button",
				value: "Widgets",
				name: "addwidget",
				width: ROSDASH.formConfig.main
			});
			break;
		// add a new ros item from textbox
		case "addfromtextbox":
			ROSDASH.addRosItem(ROSDASH.toolbar.getValue("input"));
			break;
		// show property or config of a widget or block
		case "property":
		case "allproperty":
			ROSDASH.jsonFormType = id;
			switch (ROSDASH.dashboardConf.view_type)
			{
			case "panel":
			case "editor":
				ROSDASH.callJsonForm(ROSDASH.widgets[ROSDASH.selectedWidget]);
				break;
			case "diagram":
				ROSDASH.callJsonForm(ROSDASH.blocks[ROSDASH.selectedBlock]);
				break;
			}
			break;
		case "config":
			ROSDASH.jsonFormType = id;
			ROSDASH.callJsonForm(ROSDASH.blocks[ROSDASH.selectedBlock]);
			break;
		case "msgs":
			ROSDASH.jsonFormType = id;
			ROSDASH.callJsonForm(ROSDASH.msgTypes);
			break;
		case "dashboard":
			ROSDASH.jsonFormType = "dashboardConf";
			ROSDASH.initForm();
			ROSDASH.callJsonForm(ROSDASH.dashboardConf);
			break;
		case "comment":
			var c = ROSDASH.addBlockComment();
			if (undefined !== c)
			{
				window.cy.center(c);
			}
			break;
		default:
			console.error("sidebar click error", id);
			break;
		}
	});
}
// remove all items in form
ROSDASH.removeForm = function ()
{
	if (undefined !== ROSDASH.form)
	{
		var items = ROSDASH.form.getItemsList();
		for (var i in items)
		{
			ROSDASH.form.removeItem(items[i]);
		}
	}
	ROSDASH.formList = undefined;
	ROSDASH.formItemType = undefined;
	ROSDASH.formClickBlockId = undefined;
	ROSDASH.formCount = 0;
}
// clear the form except title
ROSDASH.clearForm = function ()
{
	var items = ROSDASH.form.getItemsList();
	for (var i in items)
	{
		if (items[i] != "addlabel")
		{
			ROSDASH.form.removeItem(items[i]);
		}
	}
	ROSDASH.formCount = 1;
	ROSDASH.formClickBlockId = undefined;
}
// show items in the form if clicked
ROSDASH.showItemsInForm = function (parent)
{
	if (undefined === ROSDASH.formList)
	{
		return;
	}
	ROSDASH.clearForm();
	// back home button
	ROSDASH.form.addItem(null, {
		type: "button",
		value: "Home",
		name: "backhome",
		width: ROSDASH.formConfig.main
	}, ROSDASH.formCount);
	// previous page button
	if (typeof parent == "object")
	{
		ROSDASH.form.addItem(null, parent, ++ ROSDASH.formCount);
	}
	ROSDASH.form.addItem(null, {
		type: "label",
		label: "Directories:",
		name: "directories",
		width: ROSDASH.formConfig.main
		}, ++ ROSDASH.formCount);
	for (var i in ROSDASH.formList)
	{
		// add a directory
		if ("_" != i)
		{
			ROSDASH.form.addItem(null, {
				type: "button",
				value: i,
				name: "dir-" + i,
				width: ROSDASH.formConfig.dir
			}, ++ ROSDASH.formCount);
		} else
		{
			ROSDASH.form.addItem(null, {
				type: "label",
				label: "Items:",
				name: "items",
				width: ROSDASH.formConfig.item
				}, ++ ROSDASH.formCount);
			// add an item
			for (var i in ROSDASH.formList["_"])
			{
				ROSDASH.form.addItem(null, {
					type: "button",
					value: ROSDASH.formList["_"][i],
					name: "item-" + ROSDASH.formList["_"][i],
					width: ROSDASH.formConfig.item
				}, ++ ROSDASH.formCount);
			}
		}
	}
	// add a ros item from textbox
	if (undefined !== parent && "addROSitem" == parent.name)
	{
		ROSDASH.form.addItem(null, {
			type: "button",
			value: "add from textbox",
			name: "addfromtextbox",
			width: ROSDASH.formConfig.main
		}, ++ ROSDASH.formCount);
	}
}
// if clicking a directory
ROSDASH.formClickDir = function (name, parent)
{
	switch (name)
	{
	case "topic":
	case "service":
	case "param":
		ROSDASH.formItemType2 = name;
		break;
	}
	if (name in ROSDASH.formList && (typeof ROSDASH.formList[name] == "object" || typeof ROSDASH.formList[name] == "array"))
	{
		// show a new form of the sub-directory
		ROSDASH.formList = ROSDASH.formList[name];
		ROSDASH.showItemsInForm(parent);
	}
}
// if clicking an item
ROSDASH.formClickItem = function (name)
{
	// the callback function of clicking
	var fn = ROSDASH[ROSDASH.formItemType];
	if(typeof fn === 'function')
	{
		switch (ROSDASH.formItemType)
		{
		case "addRosItem":
			fn(name, ROSDASH.formItemType2);
			break;
		default:
			fn(name);
			break;
		}
		var count = 0;
		for (var i in ROSDASH.blocks)
		{
			++ count;
			if (count > 1)
			{
				break;
			}
		}
		// if adding the first item, zoom to a good view
		if (1 == count)
		{
			window.cy.fit();
			window.cy.zoom(1.0);
		}
	} else
	{
		console.error("form click item error", ROSDASH.formItemType, typeof fn, name);
	}
}
// if clicking a block or a widget
ROSDASH.formClickBlockId = undefined;
ROSDASH.formClickBlock = function (id)
{
	// don't view in panel
	if ("panel" == ROSDASH.dashboardConf.view_type)
	{
		return;
	}
	ROSDASH.initForm();
	// if clicking a new block, add buttons for the block
	if (undefined === ROSDASH.formClickBlockId)
	{
		ROSDASH.form.addItem(null, {
			type: "label",
			label: "Selected Block",
			name: "selectedlabel",
			width: ROSDASH.formConfig.config
			}, ++ ROSDASH.formCount);
		ROSDASH.form.addItem(null, {
			type: "button",
			value: "Property",
			name: "property",
			width: ROSDASH.formConfig.config
			}, ++ ROSDASH.formCount);
		ROSDASH.form.addItem(null, {
			type: "button",
			value: "Config",
			name: "config",
			width: ROSDASH.formConfig.config
			}, ++ ROSDASH.formCount);
		ROSDASH.form.addItem(null, {
			type: "button",
			value: "All Properties",
			name: "allproperty",
			width: ROSDASH.formConfig.config
			}, ++ ROSDASH.formCount);
	}
	ROSDASH.formClickBlockId = id;
	var show;
	switch (ROSDASH.dashboardConf.view_type)
	{
	case "panel":
	case "editor":
		show = ROSDASH.widgets[id];
		break;
	case "diagram":
		show = ROSDASH.blocks[id];
		break;
	}
	// show in jsoneditor
	ROSDASH.callJsonForm(show);
}


/////////////////////////////////////  sidebar json form by FlexiJsonEditor


// form type
ROSDASH.jsonFormType = "property";
// a json form for block or widget
ROSDASH.callJsonForm = function (block)
{
	if (undefined === block)
	{
		return;
	}
	var json;
	switch (ROSDASH.jsonFormType)
	{
	// for selective property of block
	case "property":
		switch (ROSDASH.dashboardConf.view_type)
		{
		case "panel":
		case "editor":
			json = ROSDASH.getWidgetEditableProperty(block.widgetId);
			break;
		case "diagram":
			json = ROSDASH.getBlockEditableProperty(block.id);
			break;
		}
		break;
	// for config of block
	case "config":
		switch (ROSDASH.dashboardConf.view_type)
		{
		case "panel":
		case "editor":
			json = block.config;
			break;
		case "diagram":
			json = block.config;
			break;
		}
		if (undefined === json)
		{
			config = {
				cacheable: false
			};
		}
		break;
	// for all property of block
	case "allproperty":
		switch (ROSDASH.dashboardConf.view_type)
		{
		case "panel":
		case "editor":
			json = block;
			break;
		case "diagram":
			json = block;
			break;
		}
		break;
	default:
		if (typeof block == "object" || typeof block == "array")
		{
			json = block;
		} else
		{
			json = [block];
		}
		break;
	}
	$('#jsoneditor').jsonEditor(json,
	{
		change: ROSDASH.updateJsonForm,
		propertyclick: null
	});
}
// when changes, update the form
ROSDASH.updateJsonForm = function (data)
{
	switch (ROSDASH.jsonFormType)
	{
	case "property":
		switch (ROSDASH.dashboardConf.view_type)
		{
		case "panel":
		case "editor":
			ROSDASH.callbackUpdatePanelForm(data);
			// save changed data to widget
			for (var i in data)
			{
				ROSDASH.widgets[ROSDASH.selectedWidget][i] = data[i];
			}
			break;
		case "diagram":
			ROSDASH.callbackUpdateDiagramForm(data);
			// save changed data to block
			for (var i in data)
			{
				ROSDASH.blocks[ROSDASH.selectedBlock][i] = data[i];
			}
			break;
		}
		break;
	// save changed data to config
	case "config":
		switch (ROSDASH.dashboardConf.view_type)
		{
		case "panel":
		case "editor":
			ROSDASH.widgets[ROSDASH.selectedWidget].config = data;
			break;
		case "diagram":
			ROSDASH.blocks[ROSDASH.selectedBlock].config = data;
			break;
		}
		break;
	// save changed data to dashboardConf
	case "dashboardConf":
		ROSDASH.dashboardConf = data;
		//ROSDASH.saveJson(ROSDASH.dashboardConf, "file/" + ROSDASH.dashboardConf.name + "/conf.json");
		break;
	default:
		console.error("You cannot make changes to that", ROSDASH.jsonFormType, data);
		break;
	}
	ROSDASH.ee.emitEvent('change');
}
// if change json form in panel or editor, show that immediately
ROSDASH.callbackUpdatePanelForm = function (data)
{
	// update widget title
	if (("widgetTitle" in data) && ROSDASH.widgets[ROSDASH.selectedWidget].widgetTitle != data.widgetTitle)
	{
		$("li#" + ROSDASH.selectedWidget + " div.sDashboardWidget div.sDashboardWidgetHeader span.header").html(data.widgetTitle);
	}
	// update height or width
	if (("width" in data) && ROSDASH.widgets[ROSDASH.selectedWidget].width != data.width)
	{
		$("li#" + ROSDASH.selectedWidget + " div.sDashboardWidget").width(parseFloat(data.width));
	}
	if (("height" in data) && ROSDASH.widgets[ROSDASH.selectedWidget].height != data.height)
	{
		$("li#" + ROSDASH.selectedWidget + " div.sDashboardWidget").height(parseFloat(data.height));
	}
	if (("content_height" in data) && ROSDASH.widgets[ROSDASH.selectedWidget].content_height != data.content_height)
	{
		$("li#" + ROSDASH.selectedWidget + " div.sDashboardWidget div.sDashboardWidgetContent").height(parseFloat(data.height));
	}
	if (("header_height" in data) && ROSDASH.widgets[ROSDASH.selectedWidget].header_height != data.header_height)
	{
		$("li#" + ROSDASH.selectedWidget + " div.sDashboardWidget div.sDashboardWidgetHeader").height(parseFloat(data.height));
	}
}
// if change json form in diagram, show that immediately
ROSDASH.callbackUpdateDiagramForm = function (data)
{
	// update position
	if (ROSDASH.blocks[ROSDASH.selectedBlock].x != data.x || ROSDASH.blocks[ROSDASH.selectedBlock].y != data.y)
	{
		window.cy.$('#' + ROSDASH.selectedBlock).position({x: parseFloat(data.x), y: parseFloat(data.y)});
	}
	// update name
	if (("value" in data) && ROSDASH.blocks[ROSDASH.selectedBlock].value != data.value)
	{
		ROSDASH.blocks[ROSDASH.selectedBlock].value = data.value;
		window.cy.$('#' + ROSDASH.selectedBlock).data("name", ROSDASH.getDisplayName(ROSDASH.blocks[ROSDASH.selectedBlock]));
	}
	// update rosname
	if (("rosname" in data) && ROSDASH.blocks[ROSDASH.selectedBlock].rosname != data.rosname)
	{
		ROSDASH.blocks[ROSDASH.selectedBlock].rosname = data.rosname;
		window.cy.$('#' + ROSDASH.selectedBlock).data("name", ROSDASH.getDisplayName(ROSDASH.blocks[ROSDASH.selectedBlock]));
	}
}


///////////////////////////////////// toolbars (dhtmlXToolbar)


// toolbar on the top
ROSDASH.toolbar;
ROSDASH.toolbarCanvas = "toolbarObj";

// init the toolbar for panel
ROSDASH.initToolbar = function ()
{
	if ($("#toolbarObj").length <= 0)
	{
		console.error("toolbar not ready ", "#toolbarObj");
		return;
	}
	// default settings for toolbar
	ROSDASH.toolbar = new dhtmlXToolbarObject("toolbarObj");
	ROSDASH.toolbar.setIconSize(32);
	ROSDASH.toolbar.setIconsPath("lib/dhtmlxSuite/dhtmlxToolbar/samples/common/imgs/");
	// onclick event for each button in toolbar
	ROSDASH.toolbar.attachEvent("onClick", function(id)
	{
		switch (id)
		{
		// back to main view of toolbar
		case "main":
			switch (ROSDASH.dashboardConf.view_type)
			{
			case "panel":
				ROSDASH.resetPanelToolbar();
				break;
			case "editor":
				ROSDASH.resetEditorToolbar();
				break;
			case "diagram":
				ROSDASH.resetDiagramToolbar();
				break;
			}
			break;
		// back to index.html
		case "logo":
			window.open('index.html', "_blank");
			break;
		case "docs":
			window.open('docs/index.html', "_blank");
			break;
		// go to user's page
		case "user":
			var user_text = ROSDASH.userConf.name;
			if ("Guest" != ROSDASH.userConf.name)
			{
				window.open('panel.html?owner=' + ROSDASH.userConf.name, "_blank");
			}
			break;
		// go to owner's page
		case "owner":
			window.open('panel.html?owner=' + ROSDASH.dashboardConf.name, "_blank");
			break;
		// connect with ROS
		case "connect":
			//ROSDASH.connectROS(ROSDASH.toolbar.getValue("input"));
			window.open('panel.html?owner=' + ROSDASH.dashboardConf.name + '&panel=' + ROSDASH.dashboardConf.panel_name + '&host=' + ROSDASH.toolbar.getValue("input") + '&port=9090', "_blank");
			break;
		// find a widget or block
		case "find":
			switch (ROSDASH.dashboardConf.view_type)
			{
			case "panel":
			case "editor":
				ROSDASH.findWidget(ROSDASH.toolbar.getValue("input"));
				break;
			case "diagram":
				ROSDASH.findBlock(ROSDASH.toolbar.getValue("input"));
				break;
			}
			break;
		// save to json file
		case "save":
			switch (ROSDASH.dashboardConf.view_type)
			{
			case "panel":
			case "editor":
				ROSDASH.savePanel();
				break;
			case "diagram":
				ROSDASH.saveDiagram();
				break;
			}
			break;
		// remove a widget or block
		case "remove":
			switch (ROSDASH.dashboardConf.view_type)
			{
			case "panel":
			case "editor":
				console.warning("Please click x on the widget to remove.");
				break;
			case "diagram":
				ROSDASH.removeBlock(ROSDASH.toolbar.getValue("input"));
				break;
			}
			break;
		case "undo":
			//@todo
			console.log("undo");
			break;
		case "redo":
			//@todo
			console.log("redo");
			break;
		// zindex for overlay
		case "zindex":
			$("#myCanvas").zIndex( ($("#myCanvas").zIndex() == 100) ? -10 : 100 );
			break;
		// fit the canvas for diagram
		case "fit":
			window.cy.fit();
			break;
		// add a comment in diagram
		case "addcomment":
			var c = ROSDASH.addBlockComment(ROSDASH.toolbar.getValue("input"));
			if (undefined !== c)
			{
				window.cy.center(c);
			}
			break;
		// download json
		case "download":
			/*var url = 'data/' + ROSDASH.dashboardConf.name + "/" + ROSDASH.dashboardConf.panel_name + "-";   
			switch (ROSDASH.dashboardConf.view_type)
			{
			case "panel":
			case "editor":
				url += "panel";
				break;
			case "diagram":
				url += "diagram";
				break;
			} 
			url += ".json";
			window.open(url, 'Download');*/
			ROSDASH.downloadPanel();
			break;
		case "upload":
			break;
		// switch the corresponding page
		case "dashboard":
			ROSDASH.showPage(ROSDASH.dashboardConf.view_type, "panel");
			break;
		case "diagram":
		case "panel":
		case "editor":
			ROSDASH.showPage(ROSDASH.dashboardConf.view_type, id);
			break;
		case "json":
			var url = 'json.html';
			window.open(url);
			break;
		default:
			console.error("unknown button in toolbar: ", id);
			break;
		}
	});
	switch (ROSDASH.dashboardConf.view_type)
	{
	case "panel":
		ROSDASH.resetPanelToolbar();
		break;
	case "editor":
		ROSDASH.resetEditorToolbar();
		break;
	case "diagram":
		ROSDASH.resetDiagramToolbar();
		break;
	case "json":
		ROSDASH.resetJsonToolbar();
		break;
	default:
		console.error("unknown view type for toolbar", ROSDASH.dashboardConf.view_type);
		break;
	}
}
// reset the toolbar for panel
ROSDASH.resetPanelToolbar = function ()
{
	// remove previous items
	ROSDASH.toolbar.forEachItem(function(itemId)
	{
		ROSDASH.toolbar.removeItem(itemId);
	});
	var count = 0;
	ROSDASH.toolbar.addButton("logo", count, "ROSDASH", "logo.jpg", "logo.jpg");
	ROSDASH.toolbar.addSeparator("s" + count, ++ count);

	ROSDASH.toolbar.addText("panelname", ++ count, ROSDASH.dashboardConf.panel_name);
	ROSDASH.toolbar.addSeparator("s" + count, ++ count);

	var ros_host = (undefined !== ROSDASH.dashboardConf.ros_host && "" != ROSDASH.dashboardConf.ros_host) ? ROSDASH.dashboardConf.ros_host : "disconnected";
	ROSDASH.toolbar.addText("ros", ++ count, ros_host);
	ROSDASH.toolbar.addSeparator("s" + count, ++ count);

	//ROSDASH.toolbar.addButton("download", ++ count, "download", "text_document.gif", "text_document.gif");
	ROSDASH.toolbar.addButton("editor", ++ count, "editor", "copy.gif", "copy.gif");
	ROSDASH.toolbar.addButton("diagram", ++ count, "diagram", "copy.gif", "copy.gif");
	ROSDASH.toolbar.addButton("json", ++ count, "json editor", "copy.gif", "copy.gif");
	ROSDASH.toolbar.addButton("docs", ++ count, "docs", "page_range.gif", "page_range.gif");
	ROSDASH.toolbar.addSeparator("s" + count, ++ count);

	//ROSDASH.toolbar.addButton("connect", ++ count, "connect", "new.gif", "new_dis.gif");
	ROSDASH.toolbar.addButton("zindex", ++ count, "overlay", "settings.gif", "settings.gif");
	ROSDASH.toolbar.addSeparator("s" + count, ++ count);
}
// reset the toolbar for editor
ROSDASH.resetEditorToolbar = function ()
{
	// remove previous items
	ROSDASH.toolbar.forEachItem(function(itemId)
	{
		ROSDASH.toolbar.removeItem(itemId);
	});
	var count = 0;
	ROSDASH.toolbar.addButton("logo", count, "ROSDASH", "logo.jpg", "logo.jpg");
	ROSDASH.toolbar.addSeparator("s" + count, ++ count);

	ROSDASH.toolbar.addText("panelname", ++ count, ROSDASH.dashboardConf.panel_name);
	ROSDASH.toolbar.addSeparator("s" + count, ++ count);

	var ros_host = (undefined !== ROSDASH.dashboardConf.ros_host && "" != ROSDASH.dashboardConf.ros_host) ? ROSDASH.dashboardConf.ros_host : "disconnected";
	ROSDASH.toolbar.addText("ros", ++ count, ros_host);
	ROSDASH.toolbar.addSeparator("s" + count, ++ count);

	//ROSDASH.toolbar.addButton("download", ++ count, "download", "text_document.gif", "text_document.gif");
	ROSDASH.toolbar.addButton("panel", ++ count, "dashboard", "copy.gif", "copy.gif");
	ROSDASH.toolbar.addButton("diagram", ++ count, "diagram", "copy.gif", "copy.gif");
	ROSDASH.toolbar.addButton("json", ++ count, "json editor", "copy.gif", "copy.gif");
	ROSDASH.toolbar.addButton("docs", ++ count, "docs", "page_range.gif", "page_range.gif");
	ROSDASH.toolbar.addSeparator("s" + count, ++ count);

	ROSDASH.toolbar.addInput("input", ++ count, "", 100);
	ROSDASH.toolbar.addButton("find", ++ count, "find", "cut.gif", "cut_dis.gif");
	ROSDASH.toolbar.addButton("remove", ++ count, "remove", "remove-icon.gif", "remove-icon.gif");
	ROSDASH.toolbar.addButton("undo", ++ count, "undo", "undo.gif", "undo_dis.gif");
	ROSDASH.toolbar.addButton("redo", ++ count, "redo", "redo.gif", "redo_dis.gif");
	ROSDASH.toolbar.addSeparator("s" + count, ++ count);
}
// reset the items in the toolbar for diagram
ROSDASH.resetDiagramToolbar = function ()
{
	ROSDASH.toolbar.forEachItem(function(itemId)
	{
		ROSDASH.toolbar.removeItem(itemId);
	});
	var count = 0;
	ROSDASH.toolbar.addButton("logo", count, "ROSDASH", "logo.jpg", "logo.jpg");
	ROSDASH.toolbar.addSeparator("s" + count, ++ count);

	ROSDASH.toolbar.addText("panelname", ++ count, ROSDASH.dashboardConf.panel_name);
	ROSDASH.toolbar.addSeparator("s" + count, ++ count);

	var ros_host = (undefined !== ROSDASH.dashboardConf.ros_host && "" != ROSDASH.dashboardConf.ros_host) ? ROSDASH.dashboardConf.ros_host : "disconnected";
	ROSDASH.toolbar.addText("ros", ++ count, ros_host);
	ROSDASH.toolbar.addSeparator("s" + count, ++ count);

	//ROSDASH.toolbar.addButton("download", ++ count, "download", "text_document.gif", "text_document.gif");
	ROSDASH.toolbar.addButton("panel", ++ count, "dashboard", "copy.gif", "copy.gif");
	ROSDASH.toolbar.addButton("editor", ++ count, "editor", "copy.gif", "copy.gif");
	ROSDASH.toolbar.addButton("json", ++ count, "json editor", "copy.gif", "copy.gif");
	ROSDASH.toolbar.addButton("docs", ++ count, "docs", "page_range.gif", "page_range.gif");
	ROSDASH.toolbar.addSeparator("s" + count, ++ count);

	//@bug the toolbar is too long
	ROSDASH.toolbar.addInput("input", ++ count, "", 30);
	ROSDASH.toolbar.addButton("find", ++ count, "find", "cut.gif", "cut_dis.gif");
	ROSDASH.toolbar.addButton("remove", ++ count, "remove", "remove-icon.gif", "remove-icon.gif");
	ROSDASH.toolbar.addButton("addcomment", ++ count, "add comment", "new.gif", "new_dis.gif");
	ROSDASH.toolbar.addButton("fit", ++ count, "fit", "stylesheet.gif", "stylesheet.gif");
	ROSDASH.toolbar.addButton("undo", ++ count, "undo", "undo.gif", "undo_dis.gif");
	ROSDASH.toolbar.addButton("redo", ++ count, "redo", "redo.gif", "redo_dis.gif");
	ROSDASH.toolbar.addSeparator("s" + count, ++ count);
}

//@deprecated add user name to toolbar. called when json files are ready
ROSDASH.addToolbarUserName = function ()
{
	if ($("#toolbarObj").length > 0)
	{
		var user_text = ROSDASH.userConf.name;
		if ("Guest" != ROSDASH.userConf.name)
		{
			//@todo logout
			//user_text = '<a href="panel.html?owner=' + ROSDASH.userConf.name + '" target="_blank">' + ROSDASH.userConf.name + '</a>(<a href="panel.html?status=logout">logout</a>)';
		}
		// add to toolbar
		ROSDASH.toolbar.setItemText("user", user_text);
	}
}
//ROSDASH.ee.addListener("jsonReady", ROSDASH.addToolbarUserName);
// add panel name to toolbar. called when json files are ready
ROSDASH.addToolbarPanelName = function ()
{
	// add to HTML title
	$('title').text($('title').text() + " - " + ROSDASH.dashboardConf.name + " - " + ROSDASH.dashboardConf.panel_name);
	if ($("#toolbarObj").length > 0)
	{
		// add to toolbar
		//ROSDASH.toolbar.setItemText("owner", ROSDASH.dashboardConf.name);
		ROSDASH.toolbar.setItemText("panelname", ROSDASH.dashboardConf.panel_name);
	}
}
ROSDASH.ee.addListener("jsonReady", ROSDASH.addToolbarPanelName);
// add ros host to toolbar
ROSDASH.addToolbarRosValue = function ()
{
	// add to HTML title
	$('title').text($('title').text() + " - " + ROSDASH.dashboardConf.ros_host);
	if ($("#toolbarObj").length > 0)
	{
		// add to toolbar
		ROSDASH.toolbar.setItemText("ros", ROSDASH.dashboardConf.ros_host);
	}
}

// when changes, notify user
ROSDASH.onChange = function ()
{
	if (undefined === ROSDASH.toolbar || "panel" == ROSDASH.dashboardConf.view_type)
	{
		return;
	}
	ROSDASH.toolbar.setItemText("json", '<font color="red">unsaved</font>');
}
ROSDASH.ee.addListener("change", ROSDASH.onChange);
// when saves, notify user
ROSDASH.onSave = function ()
{
	if (undefined === ROSDASH.toolbar || "panel" == ROSDASH.dashboardConf.view_type)
	{
		return;
	}
	ROSDASH.toolbar.setItemText("saving", 'saved');
}
ROSDASH.ee.addListener("saved", ROSDASH.onSave);
