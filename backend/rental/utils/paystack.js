// import https from 'https';

// const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// function paystackRequest(path, method, payload) {
//   return new Promise((resolve, reject) => {
//     const data = payload ? JSON.stringify(payload) : null;
//     const options = {
//       hostname: 'api.paystack.co',
//       port: 443,
//       path,
//       method,
//       headers: {
//         Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
//         'Content-Type': 'application/json',
//       },
//     };

//     const req = https.request(options, (res) => {
//       let body = '';
//       res.on('data', (chunk) => (body += chunk));
//       res.on('end', () => {
//         try {
//           const parsed = JSON.parse(body);
//           resolve(parsed);
//         } catch (err) {
//           reject(err);
//         }
//       });
//     });

//     req.on('error', reject);
//     if (data) req.write(data);
//     req.end();
//   });
// }

// // amount is in Naira; Paystack expects kobo
// export const initializeTransaction = ({ email, amountNaira, reference, metadata }) =>
//   paystackRequest('/transaction/initialize', 'POST', {
//     email,
//     amount: Math.round(amountNaira * 100),
//     reference,
//     metadata,
//   });

// export const verifyTransaction = (reference) =>
//   paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`, 'GET');

// export const generateReference = (prefix = 'EST') =>
//   `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;






import https from 'https';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

function paystackRequest(path, method, payload) {
  return new Promise((resolve, reject) => {
    const data = payload ? JSON.stringify(payload) : null;
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path,
      method,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// amount is in Naira; Paystack expects kobo
export const initializeTransaction = ({ email, amountNaira, reference, metadata, callbackUrl }) =>
  paystackRequest('/transaction/initialize', 'POST', {
    email,
    amount: Math.round(amountNaira * 100),
    reference,
    metadata,
    ...(callbackUrl && { callback_url: callbackUrl }),
  });

export const verifyTransaction = (reference) =>
  paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`, 'GET');

export const generateReference = (prefix = 'EST') =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;