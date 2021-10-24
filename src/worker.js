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
  var max1 = 0;
  var max2 = 0;
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
  var [max1, max2] = top2(scores);
  var letter1 = letters[scores.indexOf(max1)];
  var letter2 = letters[scores.indexOf(max2)];
  return [letter1, letter2];
}

importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.9.0/dist/tf.min.js");

let model;
(async () => {
  model = await tf.loadLayersModel("model/model.json");
})();

self.addEventListener("message", function (e) {
  e.data.result = predict(e.data.imageData);
  delete e.data.imageData;
  postMessage(e.data);
});
