// Serverless API route for Vercel deployment
// Maintains in-memory orders across warm executions

let memoryOrders = [];

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    return res.status(200).json(memoryOrders);
  }

  if (req.method === 'POST') {
    const newOrder = req.body;
    if (!newOrder || !newOrder.orderId || !newOrder.fullName || !newOrder.phoneNumber) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }
    // Remove if duplicate orderId
    memoryOrders = [newOrder, ...memoryOrders.filter(o => o.orderId !== newOrder.orderId)];
    return res.status(201).json({ success: true, order: newOrder });
  }

  if (req.method === 'PATCH') {
    const orderId = id || req.body?.orderId;
    const { status, notes } = req.body;
    let target = null;
    memoryOrders = memoryOrders.map(order => {
      if (order.orderId === orderId) {
        target = {
          ...order,
          ...(status ? { status } : {}),
          ...(notes !== undefined ? { notes } : {})
        };
        return target;
      }
      return order;
    });

    if (!target) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.status(200).json({ success: true, order: target });
  }

  if (req.method === 'DELETE') {
    const orderId = id || req.query?.id;
    if (orderId) {
      memoryOrders = memoryOrders.filter(o => o.orderId !== orderId);
      return res.status(200).json({ success: true, message: 'Order deleted' });
    } else {
      memoryOrders = [];
      return res.status(200).json({ success: true, message: 'All orders cleared' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
