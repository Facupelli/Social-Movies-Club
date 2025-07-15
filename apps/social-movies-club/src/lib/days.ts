import dayjs from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

export default dayjs;
