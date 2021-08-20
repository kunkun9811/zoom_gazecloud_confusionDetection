// TODO: Need to add/modify the corresponding id tags
// NOTE: Camera Selection
// Provides the selection functionalities by setting cameraId + UI
// ==============================================================
// Camera Selction
// It seems that the user needs to first set the default camera in their browser first…
// The camera selection only enforces the new Camera()
// rather than the GazeCloud, which seems to use the default one.
function selectCamera() {
  if (!navigator.mediaDevices.enumerateDevices) {
    let description = document.getElementById("calibrateDescription");
    description.remove();
    document.querySelector("#calibrateModal .modal-footer").hidden = false;
    return;
  }

  navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      devices = devices.filter((device) => device.kind === "videoinput");

      let description = document.getElementById("calibrateDescription");
      switch (devices.length) {
        case 0:
          description.innerText = "No camera available. Please check your device connection.";
          break;
        case 1:
          description.remove();
          document.querySelector("#calibrateModal .modal-footer").hidden = false;
          break;
        default:
          // More than one camera
          description.innerText = "Pleases choose the camera you would like to use.";

          let btn = document.createElement("button");
          btn.innerText = "Confirm";
          btn.classList.add("btn");
          btn.classList.add("btn-primary");
          btn.classList.add("btn-sm");
          btn.onclick = function (event) {
            cameraId = +Array.from(document.querySelectorAll("input[className='form-check-input']"))
              .filter((radio) => radio.checked)[0]
              .id.slice(-1);
            cameraId = devices[cameraId].deviceId;
            navigator.mediaDevices.getUserMedia({ video: { deviceId: cameraId } });
            event.target.remove();
            document.querySelector("#calibrateModal .modal-footer").hidden = false;
          };
          description.insertAdjacentElement("afterend", btn);

          devices.forEach((device, i) => {
            let radio = document.createElement("div");
            radio.classList.add("form-check");
            radio.innerHTML = `<input className="form-check-input" type="radio" name="camera" id="cameraRadio${i}">
                            <label className="form-check-label" htmlFor="cameraRadio${i}">
                            ${device.label}</label>`;
            description.insertAdjacentElement("afterend", radio);
          });
      }
    })
    .catch(function (err) {
      console.error(err.name + ": " + err.message);
    });
}
