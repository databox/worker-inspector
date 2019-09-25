"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const Config = __importStar(require("./config/config.json"));
const workerData = Config.workers;
const workers = new Map(Object.entries(workerData));
const getWorkerStats = (url) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Get response of stats
            // Set timeout of 30 sec for getting response
            const response = await axios_1.default.get(url + "/stats", { timeout: 30000 });
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    });
};
const checkRunningTimeThreshold = async (runningTime) => {
    // Half hour threshold
    if (runningTime > 1800000000) {
        return false;
    }
    else {
        return true;
    }
};
const sendToSlack = (message) => {
    axios_1.default
        .post("https://hooks.slack.com/services/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", {
        text: `${message}`
    })
        .catch(error => {
        console.log(error);
    });
};
const iterateThroughWorkers = () => {
    Array.from(workers.entries()).forEach(worker => getWorkerStats(worker[1])
        .then(results => {
        const runningWorkers = results.data.running_workers;
        Object.entries(runningWorkers).forEach(async ([id, data]) => {
            const isOverThreshold = await checkRunningTimeThreshold(data.process.running_time);
            if (!isOverThreshold) {
                // Microseconds to minutes conversion, with 2 decimal places
                const duration = (data.process.running_time /
                    1000000 /
                    60).toFixed(2);
                sendToSlack(`*${worker[0]}* worker with PID *${id}* has been running for ${duration} minutes. ${worker[1]}/stats`);
            }
        });
    })
        .catch(error => sendToSlack(`*${worker[0]}* couldn't be reached, reported error was: *${error.code}* ---> ${worker[1]}/stats`)));
};
const execute = async () => {
    await iterateThroughWorkers();
};
execute();
//# sourceMappingURL=index.js.map