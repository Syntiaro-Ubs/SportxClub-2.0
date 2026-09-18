// Deprecated PayU wrapper re-exporting Cashfree service for backward compatibility
import { cashfreeService, loadCashfreeSDK } from "./cashfree-service";

export const payuService = cashfreeService;
export { cashfreeService, loadCashfreeSDK };
export default cashfreeService;

