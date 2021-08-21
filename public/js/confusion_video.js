/* KEY: server endpoint */
// const endpoint = "http://localhost:5500/detection"; // NOTE: for development
const endpoint = "https://api.aankh.co/detection/confusion"; // NOTE: for production

// const username = 1;
// const username = 2;
// const username = 3;
const username = 1111; // TODO: need to change this

/* KEY: Some global variables - should be in another file for easier read */
// stage
const COLLECTION = 0; // data collection state
const INFERENCE = 1; // server should predict confusion status
const INCREMENT = 2; // incremental data collection

// stage frontend
const NOT_COLLECTING = 0;
const COLLECTING_CONFUSED = 1;
const COLLECTING_NEUTRAL = 2;
let curr_frontend_stage = COLLECTING_CONFUSED;

// label - in compliance to python confusion detection model
const NEUTRAL_LABEL = 0;
const CONFUSED_LABEL = 1;

// facial expression variables
let videoElement = document.getElementById("input_video");
let outputCanvasElement = document.getElementById("output_canvas");
let outputCanvasCtx = outputCanvasElement.getContext("2d");
let last_infer_time = 0;

// frameId basically
let number_of_trainings = 5;
let totalNeutral = number_of_trainings;
let totalConfused = number_of_trainings;

// specify model version
let model_ver = 0;

/* KEY: is user ready */
let userReady = false;

/* KEY: Get frontend elements */
let confusion_modal_container = document.getElementById("confusion_modal_container");
let confusion_modal_text = document.getElementById("confusion_modal_text");
let confusion_detection_result = document.getElementById("confusion_detection_result");

/** KEY: **/
/* Buttons */
const user_ready_btn = document.getElementById("user_ready_btn");
user_ready_btn.onclick = () => {
  user_ready_btn.innerHTML = "Started...";
  user_ready_btn.disabled = true;
  userReady = true;
};

const skip_confusion_calib_btn = document.getElementById("skip_confusion_calib_btn");
skip_confusion_calib_btn.onclick = () => {
  confusion_modal_container.style.display = "none";
};

window.onload = () => {
  // start video - TODO: need to handle multiple cameras
  // KEY: 1 is my camera
  if (navigator.mediaDevices.enumerateDevices) {
    console.log(navigator.mediaDevices.getUserMedia({ video: { deviceId: 1 } }));
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        if (userReady) {
          if (curr_frontend_stage !== NOT_COLLECTING) await collectUserShitRealQuick();
          else if (totalConfused <= 0 && totalNeutral <= 0) {
            if (Date.now() - last_infer_time >= 2500) cameraShit();
          }
        }
      },
    });
    camera.start();
  }
};

/* KEY: camera shit */
const cameraShit = () => {
  last_infer_time = Date.now();
  outputCanvasCtx.drawImage(videoElement, 0, 0, outputCanvasElement.width, outputCanvasElement.height);
  let cur_base64ImageData = outputCanvasElement.toDataURL();
  sendThatShitToTheBack(cur_base64ImageData);
};

const sendThatShitToTheBack = async (imgData) => {
  let new_data = {
    img: imgData,
    stage: INFERENCE,
    label: NEUTRAL_LABEL,
    // TODO: need to use model_ver
    ver: model_ver, // NOTE: let's just say version 1 of the confusion detection model for now, TODO: might need to change to 0 if there are any errors
    username: username, // NOTE: should be ok if it's a random username
    frameId: totalNeutral, // NOTE: this goes from 400 to 0. This will be subtract the "TOTAL (or 400)" in the python end of the code
  };

  await fetch(endpoint, {
    method: "POST",
    body: JSON.stringify(new_data),
    // referrerPolicy: "origin",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("--------------------------------[normal request and response]--------------------------------");
      console.log(data);
      result = data.body.result;
      // KEY: present prediction to the frontend
      confusion_detection_result.innerText = `Cognitive State = ${result}`;
    })
    .catch((err) => {
      console.log(err);
    });
};

/** Collect Phase **/
const collectUserShitRealQuick = async () => {
  outputCanvasCtx.drawImage(videoElement, 0, 0, outputCanvasElement.width, outputCanvasElement.height);
  let cur_base64ImageData = outputCanvasElement.toDataURL();
  if (curr_frontend_stage === COLLECTING_CONFUSED) await sendConfusedShitBack(cur_base64ImageData);
  else await sendNeutralShitBack(cur_base64ImageData);
};

const sendConfusedShitBack = async (imgData) => {
  let confused_data = {
    img: imgData,
    stage: COLLECTION,
    label: CONFUSED_LABEL,
    ver: model_ver,
    username: username,
    frameId: totalConfused--,
  };

  if (totalConfused <= 0) {
    confusion_modal_text.innerText = "Please make a NO EXPRESSION and click calibrate!";
    user_ready_btn.disabled = false;
    user_ready_btn.innerHTML = "Calibrate";
    user_ready_btn.onclick = () => {
      curr_frontend_stage = COLLECTING_NEUTRAL;
    };
    curr_frontend_stage = NOT_COLLECTING;
  }

  await fetch(endpoint, {
    method: "POST",
    body: JSON.stringify(confused_data),
    // referrerPolicy: "origin",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("--------------------------------[CONFUSED] COLLECTION--------------------------------");
      console.log(data);
      result = data.body.result;
      console.log(`totalConfused = ${totalConfused}`);
    })
    .catch((err) => {
      console.log(err);
    });
};

const sendNeutralShitBack = async (imgData) => {
  let neutral_data = {
    img: imgData,
    stage: COLLECTION,
    label: NEUTRAL_LABEL,
    ver: model_ver,
    username: username,
    frameId: totalNeutral--,
  };

  if (totalNeutral <= 0) {
    curr_frontend_stage = NOT_COLLECTING;
    user_ready_btn.disabled = false;
    user_ready_btn.innerHTML = "Go to Zoom!";
    user_ready_btn.onclick = () => {
      confusion_modal_container.style.display = "none";
      user_ready_btn.disabled = true;
    };
  }

  await fetch(endpoint, {
    method: "POST",
    body: JSON.stringify(neutral_data),
    // referrerPolicy: "origin",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("--------------------------------[NEUTRAL] COLLECTION--------------------------------");
      console.log(data);
      result = data.body.result;
      console.log(`totalNeutral = ${totalNeutral}`);
    })
    .catch((err) => {
      console.log(err);
    });
};
