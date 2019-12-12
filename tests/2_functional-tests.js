/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");

var _ids_testing = [];

chai.use(chaiHttp);

suite("Functional Tests", function() {
  suite("API ROUTING FOR /api/threads/:board", function() {
    suite("POST", function() {
      test("Post new thread with no parameters", function(done) {
        chai
          .request(server)
          .post("/api/threads")
          .end(function(err, res) {
            assert.ok(res);
            assert.equal(res.text, "Not Found");

            done();
          });
      });

      test("Post new thread with board", function(done) {
        chai
          .request(server)
          .post("/api/threads/test")
          .end(function(err, res) {
            assert.ok(res);
            assert.equal(res.text, "Parameter(s) is missing!");

            done();
          });
      });

      test("Post new thread with board and text (no password)", function(done) {
        chai
          .request(server)
          .post("/api/threads/test")
          .end(function(err, res) {
            assert.ok(res);
            assert.equal(res.text, "Parameter(s) is missing!");

            done();
          });
      });

      test("Post new thread with all parameters", function(done) {
        chai
          .request(server)
          .post("/api/threads/test")
          .send({
            text: "Test thread",
            delete_password: "Test password"
          })
          .end(function(err, res) {
            assert.ok(res);
            assert.notEqual(res.text, "Parameter(s) is missing!");
          });

        // Put another thread for tests
        chai
          .request(server)
          .post("/api/threads/test")
          .send({
            text: "Test thread",
            delete_password: "Test password"
          })
          .end(function(err, res) {
            done();
          });
      });
    });

    suite("GET", function() {
      test("Get threads of a board", function(done) {
        chai
          .request(server)
          .get("/api/threads/test")
          .end(function(err, res) {
            assert.ok(res);

            // Test thread
            assert.isArray(res.body);
            assert.isBelow(res.body.length, 11);
            assert.isObject(res.body[0]);
            assert.property(res.body[0], "_id");
            assert.property(res.body[0], "created_on");
            assert.property(res.body[0], "bumped_on");
            assert.property(res.body[0], "text");
            assert.property(res.body[0], "replies");
            assert.notProperty(res.body[0], "delete_password");
            assert.notProperty(res.body[0], "reported");

            // Test replies
            assert.isArray(res.body[0].replies);
            assert.isBelow(res.body[0].replies.length, 4);

            _ids_testing.push(res.body[0]._id);
            _ids_testing.push(res.body[1]._id);

            done();
          });
      });
    });

    suite("DELETE", function() {
      test("Delete a thread without passing parameters", function(done) {
        chai
          .request(server)
          .delete("/api/threads/test")
          .end(function(err, res) {
            assert.ok(res);
            assert.equal(res.text, "Parameter(s) is missing!");

            done();
          });
      });

      test("Delete a thread with wrong password", function(done) {
        chai
          .request(server)
          .delete("/api/threads/test")
          .send({
            thread_id: _ids_testing[0],
            // Probably, no password can be the same as _id (its auto generated in mongodb)
            delete_password: _ids_testing[0]
          })
          .end(function(err, res) {
            assert.ok(res);
            assert.equal(res.text, "incorrect password");

            done();
          });
      });

      test("Delete a thread with correct parameters", function(done) {
        chai
          .request(server)
          .delete("/api/threads/test")
          .send({
            thread_id: _ids_testing[0],
            delete_password: "Test password"
          })
          .end(function(err, res) {
            assert.ok(res);
            assert.equal(res.text, "success");

            done();
          });
      });
    });

    suite("PUT", function() {
      test("Report a thread", function(done) {
        chai
          .request(server)
          .put("/api/threads/test")
          .send({
            thread_id: _ids_testing[1]
          })
          .end(function(err, res) {
            assert.ok(res);
            assert.equal(res.text, "success");

            done();
          });
      });
    });
  });

  suite("API ROUTING FOR /api/replies/:board", function() {
    suite("POST", function() {
      test("Post replay to a thread", function(done) {
        chai
          .request(server)
          .post("/api/replies/test")
          .send({
            text: "Test reply",
            delete_password: "Test Password",
            thread_id: _ids_testing[1]
          })
          .end(function(err, res) {
            assert.ok(res);
            assert.notEqual(res.text, "Parameter(s) is missing!");
            done();
          });
      });
    });

    suite("GET", function() {
      test("Post replay with no thread_id", function(done) {
        chai
          .request(server)
          .get("/api/replies/test")
          .end(function(err, res) {
            assert.ok(res);
            assert.equal(res.text, "Parameter(s) is missing!");
            done();
          });
      });

      test("Post replay to thread", function(done) {
        chai
          .request(server)
          .get("/api/replies/test")
          .query({ thread_id: _ids_testing[1] })
          .end(function(err, res) {
            assert.ok(res);

            // Test thread
            assert.isObject(res.body);
            assert.property(res.body, "_id");
            assert.property(res.body, "created_on");
            assert.property(res.body, "bumped_on");
            assert.property(res.body, "text");
            assert.property(res.body, "replies");
            assert.notProperty(res.body, "delete_password");
            assert.notProperty(res.body, "reported");

            // Test replies
            assert.isArray(res.body.replies);
            assert.isObject(res.body.replies[0]);
            assert.property(res.body.replies[0], "_id");
            assert.property(res.body.replies[0], "created_on");
            assert.notProperty(res.body.replies[0], "delete_password");
            assert.notProperty(res.body.replies[0], "reported");
            assert.equal(
              res.body.replies[res.body.replies.length - 1].text,
              "Test reply"
            );

            _ids_testing.push(
              res.body.replies[res.body.replies.length - 1]._id
            );

            done();
          });
      });
    });

    suite("PUT", function() {
      test("Report reply", function(done) {
        chai
          .request(server)
          .put("/api/replies/test")
          .send({ thread_id: _ids_testing[1], reply_id: _ids_testing[2] })
          .end(function(err, res) {
            assert.ok(res);
            assert.equal(res.text, "success");

            done();
          });
      });
    });

    suite("DELETE", function() {
      test("Delete a reply without passing parameters", function(done) {
        chai
          .request(server)
          .delete("/api/replies/test")
          .end(function(err, res) {
            assert.ok(res);
            assert.equal(res.text, "Parameter(s) is missing!");

            done();
          });
      });

      test("Delete a reply with wrong password", function(done) {
        chai
          .request(server)
          .delete("/api/replies/test")
          .send({
            thread_id: _ids_testing[1],
            reply_id: _ids_testing[2],
            // Probably, no password can be the same as _id (its auto generated in mongodb)
            delete_password: _ids_testing[2]
          })
          .end(function(err, res) {
            assert.ok(res);
            assert.equal(res.text, "incorrect password");

            done();
          });
      });

      test("Delete a reply with correct parameters", function(done) {
        chai
          .request(server)
          .delete("/api/replies/test")
          .send({
            thread_id: _ids_testing[1],
            reply_id: _ids_testing[2],
            delete_password: "Test Password"
          })
          .end(function(err, res) {
            assert.ok(res);
            assert.equal(res.text, "success");

            done();
          });
      });
    });
  });
});
