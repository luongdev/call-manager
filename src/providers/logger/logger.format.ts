import { format } from 'winston';

// eslint-disable-next-line
import * as moment from 'moment';

const objToString = (arg: any) => {
  if (typeof arg === 'string') {
    return arg;
  } else if (arg instanceof Date) {
    const m = moment(arg);
    return m.format('YYYY-MM-DD HH:mm:ss');
  } else if (typeof arg === 'object') {
    return JSON.stringify(arg, null, 2);
  } else {
    return String(arg);
  }
}

const customFormat = format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = message;
  if (metadata.args) {
    msg = message.replace(/{}/g, () => {
      const arg = metadata.args.shift();

      if (arg instanceof Array) return arg.map(objToString).join(', ');

      return objToString(arg);
    });
  }

  let errorMsg = '';
  if (metadata.trace) {
    const errorMessage = metadata.trace.message;
    const stack = metadata.trace.stack || 'No stack trace';

    errorMsg =  `\nError: ${errorMessage}\nStack: ${stack}`;
  }

  return `${timestamp} [${level}]: ${msg}${errorMsg}`;
});
export default format.combine(
  format.timestamp(),
  format.json(),
  customFormat,
);
