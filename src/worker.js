const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function getAccuracyScores(imageData) {
  const score = tf.tidy(() => {
    const channels = 1;
    let input = tf.browser.fromPixels(imageData, channels);
    input = tf.cast(input, "float32").div(tf.scalar(255));
    // input = input.flatten();  // mlp
    input = input.expandDims();
    return model.predict(input).dataSync();
  });
  return score;
}

function top2(arr) {
  let max1 = 0;
  let max2 = 0;
  arr.forEach((x) => {
    if (max1 < x) {
      max2 = max1;
      max1 = x;
    }
  });
  return [max1, max2];
}

function predict(imageData) {
  const scores = getAccuracyScores(imageData);
  const [max1, max2] = top2(scores);
  const letter1 = letters[scores.indexOf(max1)];
  const letter2 = letters[scores.indexOf(max2)];
  return [letter1, letter2];
}

async function loadModel() {
  model = await tf.loadGraphModel("model/model.json");
}

importScripts(
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.16.0/dist/tf.min.js",
);

let model;
loadModel();

self.addEventListener("message", (event) => {
  event.data.result = predict(event.data.imageData);
  delete event.data.imageData;
  postMessage(event.data);
});
