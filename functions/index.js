'use strict'

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Hashids = require('hashids');
const util = require('util');

admin.initializeApp(functions.config().firebase);

exports.createSessionId = functions.database.ref('/users/{id}/newSession').onWrite(event => {
  console.log("function started...checking new session "+event.data.val());
  if (event.data.val()) {
  // set new to false
  const db = admin.database();
  console.log("create db "+event.data.val());

  const sessionCounterRef = db.ref('sessionCounter');
    console.log("grab session counter");

  sessionCounterRef.transaction(counter => {
    console.log("start transaction");
    console.log(util.inspect(counter, {showHidden: false, depth: null}));
    if (counter) {
      console.log("counter is "+counter.toString());
      const hashids = new Hashids("AIzaSyAn04oG-WxLMFRRx38rV58A6GEpSnYvBjgsplit-that-bill", 5, "abcdefghijklmnopqrstuvwxyz0123456789");
      const input = counter;
      const sessionId = hashids.encode(input);
      console.log("generated "+sessionId);

      // create new session
      // add session to user TODO
      // increment counter
      // set to false
      const sessionsRef = db.ref('/sessions');
      sessionsRef.update({
        [sessionId]: {
          host: event.params.id
        }
      });
      console.log("updated session");


      const membersRef = db.ref('/members');
      const membersIndex = membersRef.push();
      membersRef.update({
        [sessionId]: {
          [membersIndex.key]: event.params.id
        }
      });

      const incrementedCounter = counter + 1;
      sessionCounterRef.set(incrementedCounter);

      const newSessionFlag = db.ref('/users/' + event.params.id + '/newSession');
      newSessionFlag.set(false);
      console.log("its now false");

      const userSessionsRef = db.ref('/users/' + event.params.id + '/sessions');
      const userSessionIndex = userSessionsRef.push();
      userSessionsRef.update({
        [userSessionIndex]: sessionId
      });
    } 
      return counter;
  });
  }

});
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
