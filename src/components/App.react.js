import defaultConfig from 'json!../../example-configurations/default.json';

import React from 'react';
import translate from 'counterpart';
import keypress from '../lib/keypress-tool';
import Point from '../lib/ImmutablePoint';
import AppActions from '../flux/AppActions';
import SelectionStore from '../stores/SelectionStore';
import CreateConnectionStore from '../stores/CreateConnectionStore';
import WorkbenchStore from '../stores/WorkbenchStore';

import Workbench from './Workbench.react';
import RepositoryPane from './RepositoryPane.react';
import DetailPane from './DetailPane.react';
import Actions from './Actions.react';

var App = React.createClass({

	handleMouseMove(ev) {
		var x = ev.clientX;
		var y = ev.clientY;

		// Update item positions
		if (WorkbenchStore.isDragging()) {
			var mousePos = new Point(x, y);
			AppActions.moveSelectedItems(mousePos);
		} else

		// Update selection rectangle size
		if (SelectionStore.isSelecting()) {
			var mousePos = new Point(x, y);
			AppActions.resizeSelection(mousePos);
		} else

		// Update temporary wire
		if (CreateConnectionStore.isDragging()) {
			var absMousePos = WorkbenchStore.getScrollOffset().addValues(x, y);
			AppActions.resizeConnection(absMousePos);
		}
	},

	handleMouseUp(ev) {
		if (ev.button !== 0) { return; }

		var x = ev.clientX;
		var y = ev.clientY;

		// Finish selection
		if (WorkbenchStore.isDragging()) {
			var mousePos = new Point(x, y);
			AppActions.finishMovingSelectedItems(mousePos);
		} else

		// Hide selection rectangle
		if (SelectionStore.isSelecting()) {
			AppActions.finishSelection();
		} else

		// Create a connection between an input and an output
		if (CreateConnectionStore.isDragging()) {
			var absMousePos = WorkbenchStore.getScrollOffset().addValues(x, y);
			AppActions.finishConnection(absMousePos);
		}
	},

	/**
	 * Try to save the current store data to localStorage
	 */
	save() {
		if (!window.localStorage) {
			return;
		}

		var data = WorkbenchStore.exportMyFormat();
		if (data.items.length === 0) {
			localStorage.removeItem('dataBackup');
			return;
		}

		localStorage.dataBackup = JSON.stringify(data);
	},

	/**
	 * Try to restore the backed up store data from localStorage
	 */
	restore() {
		if (window.localStorage && localStorage.dataBackup) {
			try {
				WorkbenchStore.importMyFormat(JSON.parse(localStorage.dataBackup));
			} catch (e) {
				localStorage.removeItem('dataBackup');
				console.warn(e);
			}
		} else {
			console.log('Loading default configuration...');
			WorkbenchStore.importFile(defaultConfig);
		}
	},

	handleVisibilityChange() {
		if (document.hidden || document.msHidden) {
			this.save();
		}
	},

	confirmPageUnload(ev) {
		var message = translate('errors.unsaved_changes');
		ev.returnValue = message;
		return message;
	},

	componentDidMount() {
		addEventListener('mousemove', this.handleMouseMove);
		addEventListener('mouseup',   this.handleMouseUp);
		// addEventListener('beforeunload', this.confirmPageUnload);

		// This could be dangerous in case the state gets corrupted.
		// It would always write the corrupted state back on reload.
		window.addEventListener('unload', this.save);
		document.addEventListener('visibilitychange', this.handleVisibilityChange);

		keypress.on('backspace',   AppActions.deleteSelectedItems);
		keypress.on('del',         AppActions.deleteSelectedItems);
		keypress.on('a', ['ctrl'], AppActions.selectAll);
		keypress.on('esc',         AppActions.cancel);

		this.restore();
	},

	componentWillUnmount() {
		removeEventListener('mousemove', this.handleMouseMove);
		removeEventListener('mouseup',   this.handleMouseUp);
		// removeEventListener('beforeunload', this.confirmPageUnload);
		keypress.off('backspace',   AppActions.deleteSelectedItems);
		keypress.off('del',         AppActions.deleteSelectedItems);
		keypress.off('a', ['ctrl'], AppActions.selectAll);
		keypress.off('esc',         AppActions.cancel);
	},

	render() {
		return (
			<div className="m-app">
				<div className="m-container">
					<Workbench />
					<Actions />
				</div>
				<div className="m-sidebar">
					<RepositoryPane />
					<DetailPane />
				</div>
			</div>
		);
	}
});
export default App;