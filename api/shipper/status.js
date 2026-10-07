import { handleShipper } from '../_shipper.js';

export default function handler(req, res) {
  return handleShipper('status', req, res);
}
