import { get, set } from 'lodash';

const rateLimit = 10; // Number of allowed requests per minute

export const checker = (ip, rateLimiter) => {
  const now = Date.now();
  const windowStart = now - 60 * 1000; // 1 minute ago

  //The _.get() method in Lodash retrieves the object’s value at a specific path.
  //_.get(object, path, defaultValue)
  const requestTimestamps = get(rateLimiter, ip, []).filter(timestamp => timestamp > windowStart);
  requestTimestamps.push(now);
  //The _.set() method in Lodash is used to set the value at a specific path of the object.
  //_.set(object, path, value)
  set(rateLimiter, ip, requestTimestamps);

  //returning boolean value
  return requestTimestamps.length <= rateLimit;
};

const rateLimiterMiddleware = (req, res, rateLimiter) => {
  const ip = req.headers['x-real-ip'] || req.connection.remoteAddress;

  const rateLimitOk = checker(ip, rateLimiter);

  if (!rateLimitOk) {
    res
      .status(429)
      .json({ message: 'Blocked. Too Many Requests. Make another request after 1 minute.' });
    return false;
  }

  return true;
};

export default rateLimiterMiddleware;
