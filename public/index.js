/*** NOTE: Various functions for index.html ***/

/** NOTE: For GazeCloud API **/
function PlotGaze(GazeData) {
  /*
    GazeData.state // 0: valid gaze data; -1 : face tracking lost, 1 : gaze uncalibrated
    GazeData.docX // gaze x in document coordinates
    GazeData.docY // gaze y in document cordinates
    GazeData.time // timestamp
*/

  // NOTE: get DOM elements
  //   document.getElementById("GazeData").innerHTML =
  //     "GazeX: " + GazeData.GazeX + " GazeY: " + GazeData.GazeY;
  //   document.getElementById("HeadPhoseData").innerHTML =
  //     " HeadX: " +
  //     GazeData.HeadX +
  //     " HeadY: " +
  //     GazeData.HeadY +
  //     " HeadZ: " +
  //     GazeData.HeadZ;
  //   document.getElementById("HeadRotData").innerHTML =
  //     " Yaw: " +
  //     GazeData.HeadYaw +
  //     " Pitch: " +
  //     GazeData.HeadPitch +
  //     " Roll: " +
  //     GazeData.HeadRoll;

  // NOTE: user gaze's x & y coordinates predicted by GazeCloud API
  var x = GazeData.docX;
  var y = GazeData.docY;

  // NOTE: get gaze circle
  var gaze = document.getElementById("gaze");

  // NOTE: set x & y for the gaze prediction "circle" from its midpoint
  // They do it this way because the circle was set to be intialized at
  // the top, left corner. And using it's midpoint to move about the entire
  // web page
  x -= gaze.clientWidth / 2;
  y -= gaze.clientHeight / 2;

  // DEBUG: log x & y positions
  // console.log("==========================================================================================");
  // console.log(`GazeData.docX = ${x}`);
  // console.log(`GazeData.docY = ${y}`);
  // console.log(`gaze.clientWidth = ${gaze.clientWidth}`);
  // console.log(`gaze.clientHeight = ${gaze.clientHeight}`);
  // console.log(`gaze.clientWidth/2 = ${gaze.clientWidth/2}`);
  // console.log(`gaze.clientHeight/2 = ${gaze.clientHeight/2}`);
  // console.log("==========================================================================================");

  // NOTE: set the absolute position of the gaze prediction "circle"
  gaze.style.left = x + "px";
  gaze.style.top = y + "px";

  // NOTE: if the GazeData.state is not valid, a.k.a either face tracking lost (-1) or gaze uncalibrated (1)
  // don't show the gaze prediction circle
  if (GazeData.state != 0) {
    if (gaze.style.display == "block") gaze.style.display = "none";
  }
  // NOTE: if the GazeData.state is not valid, a.k.a either face tracking lost (-1) or gaze uncalibrated (1)
  // show the gaze prediction circle
  else {
    if (gaze.style.display == "none") gaze.style.display = "block";
  }
}

//////NOTE: set callbacks/////////
window.addEventListener("load", function () {
  GazeCloudAPI.OnCalibrationComplete = function () {
    console.log("gaze Calibration Complete");
  };
  GazeCloudAPI.OnCamDenied = function () {
    console.log("camera  access denied");
  };
  GazeCloudAPI.OnError = function (msg) {
    console.log("err: " + msg);
  };
  GazeCloudAPI.UseClickRecalibration = true;
  GazeCloudAPI.OnResult = PlotGaze;
});
/** END GazeCloud API **/

/** Buttons **/
const start_calib_btn = document.getElementById("start_calib_btn");
start_calib_btn.onclick = () => {
  const modal_container = document.getElementById("modal_container");
  modal_container.style.display = "none";
  GazeCloudAPI.StartEyeTracking();
};
/** END Buttons **/
