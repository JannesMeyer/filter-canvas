var webdriver      = require('selenium-webdriver');
var By             = require('selenium-webdriver').By;
var ActionSequence = require('selenium-webdriver').ActionSequence;


describe("FilterCanvas", function() {

	var driver = new webdriver.Builder()
		.forBrowser('chrome')
		.build();
	driver.get('http://localhost:3000/');

	it("loads", function(done) {
		driver.getTitle().then(function(title) {
			expect(title).toBe('Filter Canvas');
		}).then(done, abort);
	});

	it("selects elements on the workspace and offers to edit parameters", function(done) {
		driver.findElement(By.css('.m-workbench-items > .pipe')).click();
		driver.isElementPresent(By.css('form.dialog-default')).then(function(result) {
			expect(result).toBe(true);
		}).thenCatch(abort).thenFinally(done);
	});

	// TODO: doesn't have an expect
	it("drags elements on the workspace", function(done) {
		driver.findElement(By.css('.m-workbench-items > .pipe')).then(function(pipe) {
			driver.actions()
				.dragAndDrop(pipe, { x: 0, y: 100 })
				.dragAndDrop(pipe, { x: 0, y: -100 })
				.perform()
				.then(done, abort);
		});
	});

	it("cleans the workspace when the new button is clicked", function(done) {
		// TODO: make sure there is at least one element on the workspace
		driver.findElement(By.css('.icon-doc-inv')).click();

		driver.isElementPresent(By.css('.m-workbench-items > *')).then(function(present) {
			expect(present).toBe(false);
		}).then(done, abort);
	});

	// TODO: test undo and redo

	// TODO: simulate HTML5 drag and drop events
	// xit("can drag elements onto the workspace", function(done) {
	// 	driver.findElement(By.css('.m-repository-pane > .pipe-repository > .item')).then(function(pipe) {
	// 		driver.actions()
	// 			.dragAndDrop(pipe, { x: -200, y: 0 })
	// 			.perform()
	// 			.then(done, abort);
	// 	});
	// });

	afterAll(function(done) {
		driver.quit().then(done);
	});

});

function abort(err) {}