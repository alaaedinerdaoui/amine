import { handleShipper } from '../_shipper.js';

export default function handler(req, res) {
  return handleShipper('orders', req, res);
}
