import assert from "assert";
import console from "console";
import { PaymentAccountForm, PaymentAccountFormField } from "../protobuf/pb_pb";

/**
 * Collection of utilities for working with Haveno.
 */
export default class HavenoUtils {
    
  static logLevel = 0;
  static months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  static lastLogTimeMs = 0;
  static AU_PER_XMR = 1000000000000n;
  
  /**
   * Set the log level with 0 being least verbose.
   *
   * @param {int} level - the log level
   */
  static async setLogLevel(level: number) {
    assert(level === parseInt(level + "", 10) && level >= 0, "Log level must be an integer >= 0");
    HavenoUtils.logLevel = level;
  }
  
  /**
   * Get the log level.
   *
   * @return {int} the current log level
   */
  static getLogLevel(): number {
    return HavenoUtils.logLevel;
  }
    
  /**
   * Log a message. // TODO (woodser): switch to log library?
   *
   * @param {int} level - log level of the message
   * @param {string} msg - message to log
   */
  static log(level: number, msg: string) {
    assert(level === parseInt(level + "", 10) && level >= 0, "Log level must be an integer >= 0");
    if (HavenoUtils.logLevel >= level) {
      const now = Date.now();
      const formattedTimeSinceLastLog = HavenoUtils.lastLogTimeMs ? " (+" + (now - HavenoUtils.lastLogTimeMs) + " ms)" : "\t";
      HavenoUtils.lastLogTimeMs = now;    
      console.log(HavenoUtils.formatTimestamp(now) + formattedTimeSinceLastLog + "\t[L" + level + "] " + msg);
    }
  }
  
  /**
   * Format a timestamp as e.g. Jul-07 hh:mm:ss:ms. // TODO: move to GenUtils?
   * 
   * @param {number} timestamp - the timestamp in milliseconds to format
   * @return {string} the formatted timestamp
   */
  static formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return HavenoUtils.months[date.getMonth()] + "-" + date.getDate() + " " + date.getHours() + ':' + ("0"  + date.getMinutes()).substr(-2) + ':' + ("0" + date.getSeconds()).substr(-2) + ':' + ("0" + date.getMilliseconds()).substr(-2);
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
   * Stringify a payment account form.
   * 
   * @param form - form to stringify
   * @return {string} the stringified form
   */
  static formToString(form: PaymentAccountForm): string {
    let str = "";
    for (const field of form.getFieldsList()) {
      str += field.getId() + ": " + this.getFormValue(form, field.getId()) + "\n";
    }
    return str.trim();
  }
  
  /**
   * Get a form field value.
   * 
   * @param {PaymentAccountForm} form - form to get the field value from
   * @param {PaymentAccountFormField.FieldId} fieldId - id of the field to get the value from
   * @return {string} the form field value
   */
  // TODO: attach getter and setter to PaymentAccountForm prototype in typescript?
  static getFormValue(form: PaymentAccountForm, fieldId: PaymentAccountFormField.FieldId): string {
    for (const field of form.getFieldsList()) {
      if (field.getId() === fieldId) return field.getValue();
    }
    throw new Error("PaymentAccountForm does not have field " + fieldId);
  }
  
  /**
   * Set a form field value.
   * 
   * @param {PaymentAccountFormField.FieldId} fieldId - id of the field to set the value of
   * @param {string} value - field value to set
   * @param {PaymentAccountForm} form - form to get the field from
   * @return {string} the form field value
   */
  static setFormValue(fieldId: PaymentAccountFormField.FieldId, value: string, form: PaymentAccountForm): void {
    for (const field of form.getFieldsList()) {
      if (field.getId() === fieldId) {
        field.setValue(value);
        return;
      }
    }
    throw new Error("PaymentAccountForm does not have field " + fieldId);
  }

  /**
   * Wait for the duration.
   * 
   * @param {number} durationMs - the duration to wait for in milliseconds
   */
    static async waitFor(durationMs: number) {
      return new Promise(function(resolve) { setTimeout(resolve, durationMs); });
    }

  /**
   * Divide one bigint by another.
   * 
   * @param {bigint} a dividend
   * @param {bigint} b divisor
   * @returns {number} the result
   */
  static divideBI(a: bigint, b: bigint): number {
    return Number(a * 100n / b) / 100
  }

  /**
   * Convert XMR to atomic units.
   * 
   * @param {number|string} amountXmr - amount in XMR to convert to atomic units
   * @return {BigInt} amount in atomic units
   */
  static xmrToAtomicUnits(amountXmr: number|string): BigInt {
    if (typeof amountXmr === "number") amountXmr = "" + amountXmr;
    else if (typeof amountXmr !== "string") throw new Error("Must provide XMR amount as a string or js number to convert to atomic units");
    let decimalDivisor = 1;
    let decimalIdx = amountXmr.indexOf('.');
    if (decimalIdx > -1) {
      decimalDivisor = Math.pow(10, amountXmr.length - decimalIdx - 1);
      amountXmr = amountXmr.slice(0, decimalIdx) + amountXmr.slice(decimalIdx + 1);
    }
    return BigInt(amountXmr) * BigInt(HavenoUtils.AU_PER_XMR) / BigInt(decimalDivisor);
  }
  
  /**
   * Convert atomic units to XMR.
   * 
   * @param {BigInt|string} amountAtomicUnits - amount in atomic units to convert to XMR
   * @return {number} amount in XMR 
   */
  static atomicUnitsToXmr(amountAtomicUnits: BigInt|string) {
    if (typeof amountAtomicUnits === "string") amountAtomicUnits = BigInt(amountAtomicUnits);
    else if (typeof amountAtomicUnits !== "bigint") throw new Error("Must provide atomic units as BigInt or string to convert to XMR");
    const quotient: bigint = amountAtomicUnits as bigint / HavenoUtils.AU_PER_XMR;
    const remainder: bigint = amountAtomicUnits as bigint % HavenoUtils.AU_PER_XMR;
    return Number(quotient) + Number(remainder) / Number(HavenoUtils.AU_PER_XMR);
  }
}
