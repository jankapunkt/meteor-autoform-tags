// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by autoform-tags.js.
import { name as packageName } from "meteor/jkuester:autoform-tags";

// Write your tests here!
// Here is an example.
Tinytest.add('autoform-tags - example', function (test) {
  test.equal(packageName, "autoform-tags");
});
