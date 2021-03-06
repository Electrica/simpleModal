simpleModal.grid.Items = function (config) {
	config = config || {};
	if (!config.id) {
		config.id = 'simplemodal-grid-items';
	}
	Ext.applyIf(config, {
		url: simpleModal.config.connector_url,
		fields: this.getFields(config),
		columns: this.getColumns(config),
		tbar: this.getTopBar(config),
		sm: new Ext.grid.CheckboxSelectionModel(),
		baseParams: {
			action: 'mgr/item/getlist'
		},
		listeners: {
			rowDblClick: function (grid, rowIndex, e) {
				var row = grid.store.getAt(rowIndex);
				this.updateItem(grid, e, row);
			}
		},
		viewConfig: {
			forceFit: true,
			enableRowBody: true,
			autoFill: true,
			showPreview: true,
			scrollOffset: 0,
			getRowClass: function (rec, ri, p) {
				return !rec.data.active
					? 'simplemodal-grid-row-disabled'
					: '';
			}
		},
		paging: true,
		remoteSort: true,
		autoHeight: true,
	});
	simpleModal.grid.Items.superclass.constructor.call(this, config);

	// Clear selection on grid refresh
	this.store.on('load', function () {
		if (this._getSelectedIds().length) {
			this.getSelectionModel().clearSelections();
		}
	}, this);
};
Ext.extend(simpleModal.grid.Items, MODx.grid.Grid, {
    windows: {},

    getMenu: function (grid, rowIndex) {
        var ids = this._getSelectedIds();

        var row = grid.getStore().getAt(rowIndex);
        var menu = simpleModal.utils.getMenu(row.data['actions'], this, ids);

        this.addContextMenuItem(menu);
    },


	createItem: function (btn, e) {

        //if (!w) {
        //    var w = MODx.load({
        //        xtype: 'simplemodal-item-window-create',
        //        id: Ext.id(),
        //        listeners: {
        //            success: {
        //                fn: function () {
        //                    this.refresh();
        //                }, scope: this
        //            }
        //        }
        //    });
        //}
        //w.reset();
        //w.setValues({active: true});
        //w.show(Ext.EventObject.target);
        //
        //console.log(w);

		var w = MODx.load({
			xtype: 'simplemodal-item-window-create',
			id: Ext.id(),
			listeners: {
				success: {
					fn: function () {
						this.refresh();
					}, scope: this
				}
			}
		});
		w.reset();
		w.setValues({active: true});
		w.show(e.target);

        this.on('hide', function() {
            var w = this;
            window.setTimeout(function() {
                w.close()
            }, 300);
        })
	},

	updateItem: function (btn, e, row) {
		if (typeof(row) != 'undefined') {
			this.menu.record = row.data;
		}
		else if (!this.menu.record) {
			return false;
		}
		var id = this.menu.record.id;

		MODx.Ajax.request({
			url: this.config.url,
			params: {
				action: 'mgr/item/get',
				id: id
			},
			listeners: {
				success: {
					fn: function (r) {
						var w = MODx.load({
							xtype: 'simplemodal-item-window-update',
							id: Ext.id(),
							record: r,
							listeners: {
								success: {
									fn: function () {
										this.refresh();
									}, scope: this
								}
							}
						});
						w.reset();
						w.setValues(r.object);
						w.show(e.target);
					}, scope: this
				}
			}
		});
	},

	removeItem: function (act, btn, e) {
		var ids = this._getSelectedIds();
		if (!ids.length) {
			return false;
		}
		MODx.msg.confirm({
			title: ids.length > 1
				? _('simplemodal_items_remove')
				: _('simplemodal_item_remove'),
			text: ids.length > 1
				? _('simplemodal_items_remove_confirm')
				: _('simplemodal_item_remove_confirm'),
			url: this.config.url,
			params: {
				action: 'mgr/item/remove',
				ids: Ext.util.JSON.encode(ids),
			},
			listeners: {
				success: {
					fn: function (r) {
						this.refresh();
					}, scope: this
				}
			}
		});
		return true;
	},

	disableItem: function (act, btn, e) {
		var ids = this._getSelectedIds();
		if (!ids.length) {
			return false;
		}
		MODx.Ajax.request({
			url: this.config.url,
			params: {
				action: 'mgr/item/disable',
				ids: Ext.util.JSON.encode(ids),
			},
			listeners: {
				success: {
					fn: function () {
						this.refresh();
					}, scope: this
				}
			}
		})
	},

	enableItem: function (act, btn, e) {
		var ids = this._getSelectedIds();
		if (!ids.length) {
			return false;
		}
		MODx.Ajax.request({
			url: this.config.url,
			params: {
				action: 'mgr/item/enable',
				ids: Ext.util.JSON.encode(ids),
			},
			listeners: {
				success: {
					fn: function () {
						this.refresh();
					}, scope: this
				}
			}
		})
	},

	getFields: function (config) {
		return ['id', 'name', 'description', 'active', 'actions', 'time_delay', 'user_description', 'group_description', 'resource'];
	},

	getColumns: function (config) {
		return [{
			header: _('simplemodal_item_id'),
			dataIndex: 'id',
			sortable: true,
			width: 70
		}, {
			header: _('simplemodal_item_name'),
			dataIndex: 'name',
			sortable: true,
			width: 100
		}, {
			header: _('simplemodal_item_description'),
			dataIndex: 'description',
			sortable: false,
			width: 200
		},{
			header: _('simplemodal_item_user_grid'),
			dataIndex: 'user_description',
			sortable: true
		},{
			header: _('simplemodal_item_group'),
			dataIndex: 'group_description',
			sortable: true
		},{
			header: _('simplemodal_item_resource'),
			dataIndex: 'resource',
			sortable: false,
			width: 100
		}, {
            header: _('simplemodal_item_time_delay'),
            dataIndex: 'time_delay',
            sortable: false,
            width: 100
        },{
			header: _('simplemodal_item_active'),
			dataIndex: 'active',
			renderer: simpleModal.utils.renderBoolean,
			sortable: true,
			width: 100
		}, {
			header: _('simplemodal_grid_actions'),
			dataIndex: 'actions',
			renderer: simpleModal.utils.renderActions,
			sortable: false,
			width: 120,
			id: 'actions'
		}];
	},

	getTopBar: function (config) {
		return [{
			text: '<i class="icon icon-plus"></i>&nbsp;' + _('simplemodal_item_create'),
			handler: this.createItem,
			scope: this
		}, '->', {
			xtype: 'textfield',
			name: 'query',
			width: 200,
			id: config.id + '-search-field',
			emptyText: _('simplemodal_grid_search'),
			listeners: {
				render: {
					fn: function (tf) {
						tf.getEl().addKeyListener(Ext.EventObject.ENTER, function () {
							this._doSearch(tf);
						}, this);
					}, scope: this
				}
			}
		}, {
			xtype: 'button',
			id: config.id + '-search-clear',
			text: '<i class="icon icon-times"></i>',
			listeners: {
				click: {fn: this._clearSearch, scope: this}
			}
		}];
	},

	onClick: function (e) {
		var elem = e.getTarget();
		if (elem.nodeName == 'BUTTON') {
			var row = this.getSelectionModel().getSelected();
			if (typeof(row) != 'undefined') {
				var action = elem.getAttribute('action');
				if (action == 'showMenu') {
					var ri = this.getStore().find('id', row.id);
					return this._showMenu(this, ri, e);
				}
				else if (typeof this[action] === 'function') {
					this.menu.record = row.data;
					return this[action](this, e);
				}
			}
		}
		return this.processEvent('click', e);
	},

	_getSelectedIds: function () {
		var ids = [];
		var selected = this.getSelectionModel().getSelections();

		for (var i in selected) {
			if (!selected.hasOwnProperty(i)) {
				continue;
			}
			ids.push(selected[i]['id']);
		}

		return ids;
	},

	_doSearch: function (tf, nv, ov) {
		this.getStore().baseParams.query = tf.getValue();
		this.getBottomToolbar().changePage(1);
		this.refresh();
	},

	_clearSearch: function (btn, e) {
		this.getStore().baseParams.query = '';
		Ext.getCmp(this.config.id + '-search-field').setValue('');
		this.getBottomToolbar().changePage(1);
		this.refresh();
	}
});
Ext.reg('simplemodal-grid-items', simpleModal.grid.Items);
