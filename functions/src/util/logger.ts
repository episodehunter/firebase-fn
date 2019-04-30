import { setupLogger } from '@episodehunter/logger'
import { config } from "firebase-functions";

const context = {
  functionName: 'fb',
  functionVersion: '1',
  awsRequestId: '1',
  logGroupName: '',
  logStreamName: '',
  getRemainingTimeInMillis: () => Infinity
}

export const logger = setupLogger(
  config().logger.ravendsn,
  config().logger.logdnaapikey
)(context as any);
