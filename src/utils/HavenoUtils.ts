const assert = require("assert");
const console = require('console');

/**
 * Collection of utilities for working with Haveno.
 */
class HavenoUtils {
    
  static LOG_LEVEL = 0;
  static CENTINEROS_AU_MULTIPLIER = 10000;
    
  /**
   * Log a message.
   *
   * @param {int} level - log level of the message
   * @param {string} msg - message to log
   */
  static log(level: number, msg: string) {
    assert(level === parseInt(level + "", 10) && level >= 0, "Log level must be an integer >= 0");
    if (HavenoUtils.LOG_LEVEL >= level) console.log(msg);
  }
  
  /**
   * Set the log level with 0 being least verbose.
   *
   * @param {int} level - the log level
   */
  static async setLogLevel(level: number) {
    assert(level === parseInt(level + "", 10) && level >= 0, "Log level must be an integer >= 0");
    HavenoUtils.LOG_LEVEL = level;
  }
  
  /**
   * Get the log level.
   *
   * @return {int} the current log level
   */
  static getLogLevel(): number {
    return HavenoUtils.LOG_LEVEL;
  }
  
  /**
   * Kill the given process.
   * 
   * TODO (woodser): move this to monero-javascript GenUtils.js as common utility
   * 
   * @param {Process} process - the nodejs child process to child
   * @param {String} signal - the kill signal, e.g. SIGTERM, SIGKILL, SIGINT (default)
   */
  static async kill(process: any, signal?: string): Promise<void> {
    return new Promise(function(resolve, reject) {
      process.on("exit", function() { resolve(); });
      process.on("error", function(err: any) { reject(err); });
      process.kill(signal ? signal : "SIGINT");
    });
  }
  
  /**
   * Convert centineros to atomic units.
   * 
   * @param {number} centineros - denominates an amount of XMR in centineros
   * @return {BigInt} the amount denominated in atomic units
   */
  static centinerosToAtomicUnits(centineros: number): bigint {
    return BigInt(centineros) * BigInt(HavenoUtils.CENTINEROS_AU_MULTIPLIER);
  }
}

export {HavenoUtils};
