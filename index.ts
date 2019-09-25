import axios from "axios";
import * as Config from "./config/config.json";

const workerData = Config.workers;

const workers = new Map<string, string>(Object.entries(workerData));

const getWorkerStats = (url: string): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get response of stats
      // Set timeout of 30 sec for getting response
      const response = await axios.get(url + "/stats", { timeout: 30000 });
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};

const checkRunningTimeThreshold = async (
  runningTime: number
): Promise<boolean> => {
  // Half hour threshold
  if (runningTime > 1800000000) {
    return false;
  } else {
    return true;
  }
};

const sendToSlack = (message: string): void => {
  axios
    .post(
      "https://hooks.slack.com/services/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",
      {
        text: `${message}`
      }
    )
    .catch(error => {
      console.log(error);
    });
};

const iterateThroughWorkers = (): void => {
  Array.from(workers.entries()).forEach(worker =>
    getWorkerStats(worker[1])
      .then(results => {
        const runningWorkers: object = results.data.running_workers;
        Object.entries(runningWorkers).forEach(async ([id, data]) => {
          const isOverThreshold: boolean = await checkRunningTimeThreshold(
            data.process.running_time
          );
          if (!isOverThreshold) {
            // Microseconds to minutes conversion, with 2 decimal places
            const duration: string = (
              data.process.running_time /
              1000000 /
              60
            ).toFixed(2);
            sendToSlack(
              `*${worker[0]}* worker with PID *${id}* has been running for ${duration} minutes. ${worker[1]}/stats`
            );
          }
        });
      })
      .catch(error =>
        sendToSlack(
          `*${worker[0]}* couldn't be reached, reported error was: *${error.code}* ---> ${worker[1]}/stats`
        )
      )
  );
};

const execute = async () => {
  await iterateThroughWorkers();
};

execute();
