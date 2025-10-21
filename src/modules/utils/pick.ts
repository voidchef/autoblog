/**
 * Create an object composed of the picked object properties
 * @param {Record<string, any>} object
 * @param {string[]} keys
 * @returns {Object}
 */
const pick = (object: Record<string, any>, keys: string[]): object =>
  keys.reduce((obj: any, key: string) => {
    // Check if property exists as own property or as a getter/inherited property
    // Special handling for Express request properties (params, query, body)
    const hasProperty = Object.prototype.hasOwnProperty.call(object, key) || 
                       (['params', 'query', 'body'].includes(key) && key in object);
    
    if (object && hasProperty) {
      // eslint-disable-next-line no-param-reassign
      obj[key] = object[key];
    }
    return obj;
  }, {});

export default pick;
