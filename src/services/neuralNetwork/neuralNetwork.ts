import path from "node:path";

import ort from "onnxruntime-node";

const NN_MODEL_PATH = path.join(process.cwd(), "src", "services", "neuralNetwork", "model.onnx");

export const factoryNeuralNetwork = () => {
  const session = ort.InferenceSession.create(NN_MODEL_PATH);

  return {
    predict: async (positionBinary: number[]) => {
      const readySession = await session;

      const inputTensor = new ort.Tensor("float32", Float32Array.from(positionBinary));
      const feed = { input: inputTensor.reshape([1, 800]) };

      const prediction = await readySession.run(feed);
      const output = await prediction.output?.getData();
      const probability = output?.[0];

      if (typeof probability !== "number") {
        throw new TypeError(`Wrong neural network output: ${typeof probability}`);
      }

      return probability >= 0.5;
    },
  };
};
