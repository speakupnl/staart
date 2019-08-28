import { CronJob } from "cron";

export default () => {
  new CronJob("0 0 * * *", () => {}, undefined, true);
};
