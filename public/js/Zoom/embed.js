// 2020.10.29 All in iframe
// let testTool = window.testTool;
// NOTE: initially, the iframe will contain "startMeeting.html" content
let startMeetingURL = "startMeeting.html";
testTool.createZoomNode("websdk-iframe", startMeetingURL);

let container = document.getElementById("container");
container.insertAdjacentElement(
  "beforeend",
  document.getElementById("websdk-iframe")
);
